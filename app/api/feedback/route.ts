import { NextResponse } from "next/server";
import { dbConnection } from "@/app/lib/database";
import { Feedback } from "@/app/lib/model";
import { isEmail } from 'validator';

export async function POST(request: Request) {
  try {
    await dbConnection();
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }
    if (!isEmail(email)) {
        return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
      }
    const feedback = await Feedback.create({
      email,
      message,
    });

    return NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
} 