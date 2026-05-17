const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/database");

dotenv.config();

const PORT = process.env.PORT || 3004;

connectDB();

app.listen(PORT, () => {
  console.log(`File-service corriendo en http://localhost:${PORT}`);
});