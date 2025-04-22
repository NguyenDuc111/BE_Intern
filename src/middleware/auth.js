import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

dotenv.config();

const models = initModels(sequelize);
const { Users, Roles } = models;

// Middleware: Xác thực người dùng qua token JWT
export const isAuthenticated = async (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. Invalid token format." });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "cholimex2025secret"
    );
    if (!decoded.UserID || !decoded.Email) {
      return res
        .status(401)
        .json({ error: "Invalid token. Missing UserID or Email." });
    }

    // Tìm người dùng trong database
    const user = await Users.findOne({
      where: { UserID: decoded.UserID, Email: decoded.Email },
      include: [
        {
          model: Roles,
          as: "Role",
          attributes: ["RoleName"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    // Gắn thông tin người dùng vào req.user
    req.user = {
      UserID: user.UserID,
      Email: user.Email,
      RoleName: user.Role ? user.Role.RoleName : null,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Verification failed." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    }
    res.status(500).json({ error: `Authentication error: ${error.message}` });
  }
};

// Middleware: Kiểm tra vai trò admin
export const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.RoleName !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }
  next();
};
