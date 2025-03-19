import pool from "../config/db";

class CalendarService {
  static async getAvailableSlots(
    date: string,
    products: string[],
    language: string,
    rating: string
  ) {
    try {

      const availableSlots = await this.getMatchingSlots(
        date,
        products,
        language,
        rating
      );

      if (availableSlots.length === 0) return [];

      const managerIds = [
        ...new Set(availableSlots.map((s) => s.sales_manager_id)),
      ];
      const bookedSlots = await this.getBookedSlots(managerIds, date);

      const validSlots = availableSlots.filter(
        (slot) => !this.hasOverlappingBooked(slot, bookedSlots)
      );

      return this.aggregateAvailableSlots(validSlots);
    } catch (err) {
      console.error("Error processing slots:", err);
      throw new Error("Failed to get available slots");
    }
  }

  private static async getMatchingSlots(
    date: string,
    products: string[],
    language: string,
    rating: string
  ) {
    const query = `
      SELECT
        s.start_date,
        sm.id AS sales_manager_id,
        sm.languages,
        sm.products,
        sm.customer_ratings
      FROM slots s
      JOIN sales_managers sm ON s.sales_manager_id = sm.id
      WHERE
        s.booked = false
        AND $1 = ANY(sm.languages)
        AND sm.products @> $2
        AND $3 = ANY(sm.customer_ratings)
        AND DATE(s.start_date) = $4
      ORDER BY s.start_date
    `;

    const { rows } = await pool.query(query, [
      language,
      products,
      rating,
      date,
    ]);
    return rows;
  }

  private static async getBookedSlots(managerIds: number[], date: string) {
    if (managerIds.length === 0) return [];

    const query = `
      SELECT start_date, sales_manager_id 
      FROM slots 
      WHERE 
        booked = true 
        AND sales_manager_id = ANY($1) 
        AND DATE(start_date) = $2
    `;

    const { rows } = await pool.query(query, [managerIds, date]);
    return rows;
  }

  private static hasOverlappingBooked(slot: any, bookedSlots: any[]) {
    const slotStart = new Date(slot.start_date);
    const slotEnd = new Date(slotStart.getTime() + 3600000); // +1 hour

    return bookedSlots.some((booked) => {
      if (booked.sales_manager_id !== slot.sales_manager_id) return false;

      const bookedStart = new Date(booked.start_date);
      const bookedEnd = new Date(bookedStart.getTime() + 3600000);

      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  }

  private static aggregateAvailableSlots(slots: any[]) {
    const counts: { [key: string]: number } = {};

    slots.forEach((slot) => {
      const isoTime = new Date(slot.start_date).toISOString();
      counts[isoTime] = (counts[isoTime] || 0) + 1;
    });

    return Object.entries(counts).map(([start_date, available_count]) => ({
      start_date,
      available_count,
    }));
  }
}

export default CalendarService;
