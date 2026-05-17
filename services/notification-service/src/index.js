import dotenv from "dotenv";

import app from "./app.js";
import { connectDB } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 3007;

await connectDB();

app.listen(PORT, () => {
  console.log(`Notification-service corriendo en http://localhost:${PORT}`);
});