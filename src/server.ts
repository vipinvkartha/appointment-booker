import dotenv from "dotenv";
import express from "express";
import calendarRoutes from "./routes/calendarRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/calendar", calendarRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
