import express from "express";
import CalendarController from "../controllers/CalendarController";

const router = express.Router();

router.post("/query", CalendarController.queryAvailableSlots);

export default router;
