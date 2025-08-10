import express from "express";
import { 
  generateEventOpinion,
  saveEventOpinion,
  getEventReport,
  getEventStatistics, // Add this
  getDetailedReportForUser
} from "../controllers/reportController.js";
import mongoose from "mongoose";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user-report/:event",protect, getDetailedReportForUser);
router.post("/generate/:eventId", generateEventOpinion);
router.put("/:reportId", protect, saveEventOpinion);
router.get("/event/:eventId", protect, getEventReport);
router.get("/stats/:eventId", protect, getEventStatistics);

export default router;