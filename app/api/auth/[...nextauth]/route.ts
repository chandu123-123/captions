
import GoogleProvider from "next-auth/providers/google";
import { dbConnection } from "@/app/lib/database"; // Ensure this exports a function to connect to MongoDB
import { UserLogin } from "@/app/lib/model"; // Ensure this exports the Mongoose model
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }