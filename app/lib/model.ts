import { Schema, model, models, Model, Document } from "mongoose";

// Define the interface for the UserLogin document
export interface IUserLogin extends Document {
  email: string;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const userLoginSchema = new Schema<IUserLogin>(
  {
    email: { type: String, required: true },
    credits: { type: Number, default: 2 },
  },
  {
    timestamps: true, // Automatically manages `createdAt` and `updatedAt` fields
  }
);

// Export the model, creating it only if it doesn't already exist
export const UserLogin: Model<IUserLogin> =
  models.Hookup || model<IUserLogin>("Hookup", userLoginSchema);
