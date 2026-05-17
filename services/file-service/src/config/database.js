const mongoose = require("mongoose");

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI no está definido en el .env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB conectado correctamente en File Service");
  } catch (error) {
    console.error("Error conectando MongoDB:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;