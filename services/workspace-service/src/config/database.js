import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI no está definido en el .env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB conectado correctamente en Workspace Service");
  } catch (error) {
    console.error("Error conectando MongoDB:", error.message);
    process.exit(1);
  }
}