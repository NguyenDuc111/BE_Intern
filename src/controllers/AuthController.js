import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const models = initModels(sequelize);
const { Customers, ResetTokens } = models;

//API đăng ký
export const signUp = async (req, res) => {
  try {
    const { FullName, Email, Password, Phone, Address } = req.body;

    // Kiểm tra email
    const existingCustomer = await Customers.findOne({ where: { Email } });
    if (existingCustomer) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Tạo khách hàng
    const customer = await Customers.create({
      FullName,
      Email,
      Password: hashedPassword,
      Phone,
      Address,
    });

    res
      .status(201)
      .json({ message: "Customer registered successfully", customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//API đăng nhập
export const signIn = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Tìm khách hàng
    const customer = await Customers.findOne({ where: { Email } });
    if (!customer) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(Password, customer.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { CustomerID: customer.CustomerID, Email: customer.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//API quên mật khẩu
export const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    // Tìm khách hàng
    const customer = await Customers.findOne({ where: { Email } });
    if (!customer) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Tạo token reset
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ

    // Lưu token
    await ResetTokens.create({
      CustomerID: customer.CustomerID,
      Token: token,
      ExpiresAt: expiresAt,
    });

    res.status(200).json({ message: "Reset token generated", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//API reset mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { OldPassword, NewPassword } = req.body;
    const customerId = req.customer.CustomerID; // Lấy từ JWT

    // Tìm khách hàng
    const customer = await Customers.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(
      OldPassword,
      customer.Password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(NewPassword, 10);

    // Cập nhật mật khẩu
    await customer.update({ Password: hashedNewPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
