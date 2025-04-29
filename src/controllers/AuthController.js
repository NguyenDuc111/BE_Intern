import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import nodemailer from "nodemailer";

dotenv.config();

const models = initModels(sequelize);
const { Users, Roles, ResetToken } = models;

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm validate dữ liệu
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^\d{6,}$/;
  return passwordRegex.test(password);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d+$/;
  return phoneRegex.test(phone);
};

const validateFullName = (fullName) => {
  const fullNameRegex = /^[A-Za-z\s]+$/;
  return fullNameRegex.test(fullName);
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Validate email
    if (!Email || !validateEmail(Email)) {
      return res.status(400).json({ error: "Email không đúng định dạng." });
    }

    // Validate password
    if (!Password || !validatePassword(Password)) {
      return res.status(400).json({
        error: "Mật khẩu phải có ít nhất 6 chữ số.",
      });
    }

    // Kiểm tra email
    const user = await Users.findOne({
      where: { Email },
      include: [{ model: Roles, as: "Role", attributes: ["RoleName"] }],
    });

    if (!user) {
      return res.status(401).json({ error: "Email không hợp lệ." });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Mật khẩu không hợp lệ." });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        FullName: user.FullName,
        Phone: user.Phone,
        Address: user.Address,
        RoleName: user.Role.RoleName,
      },
      process.env.JWT_SECRET || "cholimex2025secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Đăng nhập thành công!", token });
  } catch (error) {
    res.status(500).json({ error: `Lỗi khi đăng nhập: ${error.message}` });
  }
};

// Đăng ký
export const signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { FullName, Email, Password, Phone, Address } = req.body;

    // Validate FullName
    if (!FullName || !validateFullName(FullName)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Họ tên chỉ có thể nhập chữ cái và khoảng trống." });
    }

    // Validate Email
    if (!Email || !validateEmail(Email)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Email không đúng định dạng." });
    }

    // Validate Password
    if (!Password || !validatePassword(Password)) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Mật khẩu phải có ít nhất 6 chữ số.",
      });
    }

    // Validate Phone
    if (!Phone || !validatePhone(Phone)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "SĐT chỉ có thể nhập số." });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await Users.findOne({ where: { Email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: "Email đã tồn tại." });
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
      return res.status(500).json({ error: "Không thể tìm thấy người dùng." });
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
    res.status(201).json({ message: "Đăng ký thành công, bạn có thể đăng nhập." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi đăng ký: ${error.message}` });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Email } = req.body;

    // Validate Email
    if (!Email || !validateEmail(Email)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Email không đúng định dạng." });
    }

    // Kiểm tra email
    const user = await Users.findOne({ where: { Email }, transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Email Không tồn tại." });
    }

    // Tạo token reset
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ

    // Lưu token vào ResetToken
    await ResetToken.create(
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
      .json({ message: "Link reset mật khẩu đã được gửi qua mail của bạn." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi thao tác: ${error.message}` });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Token, NewPassword } = req.body; 

    // Validate NewPassword
    if (!NewPassword || !validatePassword(NewPassword)) {
      await transaction.rollback();
      return res.status(400).json({
        error:
          "Mật khẩu mới ít nhất phải có 6 số.",
      });
    }

    // Kiểm tra token
    const resetToken = await ResetToken.findOne({
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
      return res.status(404).json({ error: "Không thể tìm thấy người dùng." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await user.update({ Password: hashedPassword }, { transaction });

    // Xóa token sau khi sử dụng
    await ResetToken.destroy({ where: { Token }, transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi đặt lại mật khẩu: ${error.message}` });
  }
};

// Thay đổi mật khẩu (khi đã đăng nhập)
export const changePassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { OldPassword, NewPassword } = req.body;
    const { UserID } = req.user;

    // Validate OldPassword
    if (!OldPassword || !validatePassword(OldPassword)) {
      await transaction.rollback();
      return res.status(400).json({
        error:
          "Mật khẩu cũ phải đúng, ít nhất 6 số.",
      });
    }

    // Validate NewPassword
    if (!NewPassword || !validatePassword(NewPassword)) {
      await transaction.rollback();
      return res.status(400).json({
        error:
          "Mật khẩu mới ít nhất phải có 6 số.",
      });
    }

    // Tìm người dùng
    const user = await Users.findByPk(UserID, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không thể tìm thấy người dùng." });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(OldPassword, user.Password);
    if (!isMatch) {
      await transaction.rollback();
      return res.status(401).json({ error: "Mật khẩu cũ không chính xác." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await user.update({ Password: hashedPassword }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã thay đổi mật khẩu thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi đổi mật khẩu: ${error.message}` });
  }
};
