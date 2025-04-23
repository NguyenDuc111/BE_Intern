import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
  getAllNotifications,
} from "../controllers/NotificationController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint xem thông báo 
router.get("/noti", isAuthenticated, getNotifications);
//endpoint đánh dấu đã đọc
router.post("/noti/read/:id", isAuthenticated, markNotificationAsRead);
//endpoint thêm thông báo
router.post("/noti-add", isAuthenticated, isAdmin, createNotification);
//endpoint xóa thông báo
router.delete("/noti-del/:id", isAuthenticated, isAdmin, deleteNotification);
//endpoint lấy danh sách thông báo 
router.get("/noti-all", isAuthenticated, isAdmin, getAllNotifications); 

export default router;
