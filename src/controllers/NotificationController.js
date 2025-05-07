import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import Sequelize from "sequelize";

const models = initModels(sequelize);
const { Notification, Users } = models;
const { Op } = Sequelize;

// Lấy danh sách thông báo
export const getNotifications = async (req, res) => {
  try {
    const { UserID } = req.user;

    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [{ UserID }, { UserID: null }],
      },
      attributes: ["NotificationID", "Title", "Message", "IsRead"],
      order: [["NotificationID", "DESC"]],
    });

    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách thông báo: ${error.message}` });
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { UserID } = req.user;

    const notifications = await Notification.findByPk(id, { transaction });
    if (!notifications) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy thông báo." });
    }

    if (notifications.UserID !== null && notifications.UserID !== UserID) {
      await transaction.rollback();
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    await notifications.update({ IsRead: true }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã đánh dấu thông báo là đã đọc." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi đánh dấu thông báo: ${error.message}` });
  }
};

// Tạo thông báo (admin)
export const createNotification = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID, Title, Message } = req.body;

    const notification = await Notification.create(
      { UserID, Title, Message, IsRead: false },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Đã tạo thông báo thành công.", notification });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi tạo thông báo: ${error.message}` });
  }
};

// Xem danh sách thông báo
export const getAllNotifications = async (req, res) => {
  try {
    const notification = await Notification.findAll({
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["UserID", "FullName"],
          required: false,
        },
      ],
      attributes: ["NotificationID", "Title", "Message", "IsRead"],
    });
    res.status(200).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách thông báo: ${error.message}` });
  }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id, { transaction });
    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy thông báo." });
    }

    await notification.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa thông báo thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa thông báo: ${error.message}` });
  }
};
