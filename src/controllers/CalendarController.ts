import { Request, Response } from "express";
import CalendarService from "../services/CalendarService";

class CalendarController {
  static async queryAvailableSlots(req: Request, res: Response) {
    try {
      const { date, products, language, rating } = req.body;
      const slots = await CalendarService.getAvailableSlots(
        date,
        products,
        language,
        rating
      );
      res.json(slots);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default CalendarController;
