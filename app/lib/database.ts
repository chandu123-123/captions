import mongoose from "mongoose";

export async function dbConnection(): Promise<void> {
  try {
    if (!process.env.MONGO) {
      throw new Error("MONGO environment variable is not defined.");
    }

    await mongoose.connect(process.env.MONGO);
    //console.log("Database connected");
  } catch (err) {
    console.error("Error connecting to database:", err);
    throw err; // Optional: rethrow the error if needed
  }
}


