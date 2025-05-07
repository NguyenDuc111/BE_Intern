import express from "express";
import { getRevenueStatistics } from "../controllers/StatisticsController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Thống kê doanh thu
router.get("/static", isAuthenticated, isAdmin, getRevenueStatistics);

export default router;
