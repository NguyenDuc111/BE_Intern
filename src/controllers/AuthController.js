import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import sequelize from '../config/db.js';
import initModels from '../models/init-models.js';

dotenv.config();

const models = initModels(sequelize);
const { Users, Roles, ResetTokens } = models;

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Kiểm tra email
    const user = await Users.findOne({
      where: { Email },
      include: [{ model: Roles, as: 'Role', attributes: ['RoleName'] }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        RoleName: user.Role.RoleName,
      },
      process.env.JWT_SECRET || 'cholimex2025secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token });
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
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Gán vai trò user
    const userRole = await Roles.findOne({ where: { RoleName: 'user' }, transaction });
    if (!userRole) {
      await transaction.rollback();
      return res.status(500).json({ error: 'User role not found.' });
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
    res.status(201).json({ message: 'Signup successful. Please login.' });
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
      return res.status(404).json({ error: 'Email not found.' });
    }

    // Tạo token reset
    const token = crypto.randomBytes(32).toString('hex');
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

    await transaction.commit();
    res.status(200).json({ message: 'Password reset token generated.', token });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Forgot password error: ${error.message}` });
  }
};

// Thay đổi mật khẩu
export const changePassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Token, NewPassword, OldPassword } = req.body;

    let user;

    if (Token) {
      // Thay đổi mật khẩu qua token reset
      const resetToken = await ResetTokens.findOne({ where: { Token }, transaction });
      if (!resetToken) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Invalid or expired token.' });
      }

      if (resetToken.ExpiresAt < new Date()) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Token has expired.' });
      }

      user = await Users.findByPk(resetToken.UserID, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: 'User not found.' });
      }

      // Xóa token sau khi sử dụng
      await ResetTokens.destroy({ where: { Token }, transaction });
    } else if (req.user) {
      // Thay đổi mật khẩu khi đã đăng nhập
      user = await Users.findByPk(req.user.UserID, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: 'User not found.' });
      }

      // Kiểm tra mật khẩu cũ
      if (!OldPassword) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Old password is required.' });
      }

      const isMatch = await bcrypt.compare(OldPassword, user.Password);
      if (!isMatch) {
        await transaction.rollback();
        return res.status(401).json({ error: 'Incorrect old password.' });
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({ error: 'Token or authentication required.' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await user.update({ Password: hashedPassword }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Change password error: ${error.message}` });
  }
};