import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import shortid from "shortid";
import crypto from "crypto";
// import Payment from "@/lib/model"
// import { dbconnection } from "@/lib/database";

// Initialize Razorpay instance with API keys
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY as string,
  key_secret: process.env.RAZORPAY_API_SECRET as string,
});

// Define the request and response handler
export async function POST(req: Request): Promise<NextResponse> {
  console.log("Payment verification initiated");

  try {
    // Parse JSON request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: 
    { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; } = await req.json();

    // Generate the signature string
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
      .update(body)
      .digest("hex");

    // Verify signature authenticity
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // If the payment is verified, perform further actions like saving to the database
      console.log("Payment verification successful");

      // Uncomment if you have a database setup
      // await dbconnection();
      // await Payment.create({
      //   razorpay_order_id,
      //   razorpay_payment_id,
      //   razorpay_signature,
      // });

      // Redirect to payment success page
      // return NextResponse.redirect(new URL('/paymentsuccess', req.url));

      return NextResponse.json({
        message: "success",
      }, {
        status: 200,
      });
    } else {
      // If the signature doesn't match, return failure response
      console.log("Payment verification failed");
      return NextResponse.json({
        message: "fail",
      }, {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    return NextResponse.json({
      message: "Internal Server Error",
      error: error.message,
    }, {
      status: 500,
    });
  }
}
