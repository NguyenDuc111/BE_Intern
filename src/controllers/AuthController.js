import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import nodemailer from "nodemailer";

dotenv.config();

const models = initModels(sequelize);
const { Users, Roles, ResetTokens } = models;

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Kiểm tra email
    const user = await Users.findOne({
      where: { Email },
      include: [{ model: Roles, as: "Role", attributes: ["RoleName"] }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        RoleName: user.Role.RoleName,
      },
      process.env.JWT_SECRET || "cholimex2025secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: `Login error: ${error.message}` });
  }
};

// Đăng ký
export const signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { FullName, Email, Password, Phone, Address } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await Users.findOne({ where: { Email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: "Email already exists." });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Gán vai trò user
    const userRole = await Roles.findOne({
      where: { RoleName: "user" },
      transaction,
    });
    if (!userRole) {
      await transaction.rollback();
      return res.status(500).json({ error: "User role not found." });
    }

    // Tạo người dùng mới
    await Users.create(
      {
        RoleID: userRole.RoleID,
        FullName,
        Email,
        Password: hashedPassword,
        Phone,
        Address,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Signup successful. Please login." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Signup error: ${error.message}` });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Email } = req.body;

    // Kiểm tra email
    const user = await Users.findOne({ where: { Email }, transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Email not found." });
    }

    // Tạo token reset
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ

    // Lưu token vào ResetTokens
    await ResetTokens.create(
      {
        UserID: user.UserID,
        Token: token,
        ExpiresAt: expiresAt,
      },
      { transaction }
    );

    // Tạo link reset
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Gửi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: "Đặt lại mật khẩu Cholimex",
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Forgot password error: ${error.message}` });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Token, NewPassword } = req.body;

    // Kiểm tra token
    const resetToken = await ResetTokens.findOne({
      where: { Token },
      transaction,
    });
    if (!resetToken) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    if (resetToken.ExpiresAt < new Date()) {
      await transaction.rollback();
      return res.status(400).json({ error: "Token has expired." });
    }

    // Tìm người dùng
    const user = await Users.findByPk(resetToken.UserID, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await user.update({ Password: hashedPassword }, { transaction });

    // Xóa token sau khi sử dụng
    await ResetTokens.destroy({ where: { Token }, transaction });

    await transaction.commit();
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Reset password error: ${error.message}` });
  }
};

// Thay đổi mật khẩu (khi đã đăng nhập)
export const changePassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { OldPassword, NewPassword } = req.body;
    const { UserID } = req.user;

    // Tìm người dùng
    const user = await Users.findByPk(UserID, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found." });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(OldPassword, user.Password);
    if (!isMatch) {
      await transaction.rollback();
      return res.status(401).json({ error: "Incorrect old password." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await user.update({ Password: hashedPassword }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Change password error: ${error.message}` });
  }
};
