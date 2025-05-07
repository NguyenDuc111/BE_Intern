import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

dotenv.config();

const models = initModels(sequelize);
const { Users, Roles } = models;

// Lấy danh sách tất cả người dùng (chỉ admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [{ model: Roles, as: "Role", attributes: ["RoleName"] }],
      attributes: [
        "UserID",
        "FullName",
        "Email",
        "Phone",
        "Address",
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách người dùng: ${error.message}` });
  }
};

// Lấy thông tin chi tiết người dùng
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findByPk(id, {
      include: [{ model: Roles, as: "Role", attributes: ["RoleName"] }],
      attributes: [
        "UserID",
        "FullName",
        "Email",
        "Phone",
        "Address",
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // Chỉ cho phép người dùng xem thông tin của chính họ hoặc admin
    if (req.user.UserID !== user.UserID && req.user.RoleName !== "admin") {
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy thông tin người dùng: ${error.message}` });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { FullName, Email, Phone, Address, Password } = req.body;

    const user = await Users.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // Chỉ cho phép người dùng cập nhật thông tin của chính họ hoặc admin
    if (req.user.UserID !== user.UserID && req.user.RoleName !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    // Kiểm tra email mới (nếu có)
    if (Email && Email !== user.Email) {
      const existingUser = await Users.findOne({
        where: { Email },
        transaction,
      });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({ error: "Email đã tồn tại." });
      }
    }

    // Mã hóa mật khẩu mới (nếu có)
    let hashedPassword = user.Password;
    if (Password) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    // Cập nhật thông tin
    await user.update(
      {
        FullName: FullName || user.FullName,
        Email: Email || user.Email,
        Phone: Phone || user.Phone,
        Address: Address || user.Address,
        Password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã cập nhật thông tin người dùng thành công." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật người dùng: ${error.message}` });
  }
};

// Xóa người dùng (chỉ admin)
export const deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const user = await Users.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // Không cho phép xóa chính mình
    if (req.user.UserID === user.UserID) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Không thể xóa tài khoản của chính bạn." });
    }

    await user.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa người dùng thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa người dùng: ${error.message}` });
  }
};
