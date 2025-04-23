import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Notifications } = models;

// Lấy danh sách thông báo
export const getNotifications = async (req, res) => {
  try {
    const { UserID } = req.user;

    const notifications = await Notifications.findAll({
      where: {
        [models.Sequelize.Op.or]: [{ UserID }, { UserID: null }],
      },
      attributes: ["NotificationID", "Title", "Message", "IsRead", "CreatedAt"],
      order: [["CreatedAt", "DESC"]],
    });

    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Get notifications error: ${error.message}` });
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { UserID } = req.user;

    const notification = await Notifications.findByPk(id, { transaction });
    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ error: "Notification not found." });
    }

    if (notification.UserID !== null && notification.UserID !== UserID) {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied." });
    }

    await notification.update({ IsRead: true }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Mark notification error: ${error.message}` });
  }
};

// Tạo thông báo (admin)
export const createNotification = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID, Title, Message } = req.body;

    const notification = await Notifications.create(
      { UserID, Title, Message, IsRead: false },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Notification created successfully.", notification });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Create notification error: ${error.message}` });
  }
};

// Xem danh sách thông báo
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["UserID", "FullName"],
          required: false,
        },
      ],
      attributes: ["NotificationID", "Title", "Message", "IsRead", "CreatedAt"],
    });
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Get notifications error: ${error.message}` });
  }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const notification = await Notifications.findByPk(id, { transaction });
    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ error: "Notification not found." });
    }

    await notification.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Delete notification error: ${error.message}` });
  }
};
