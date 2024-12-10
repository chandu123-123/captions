import { NextResponse } from "next/server";
import shortid from "shortid";

// Import Razorpay correctly
const Razorpay = require('razorpay');

// Initialize Razorpay instance with API keys
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY as string,
  key_secret: process.env.RAZORPAY_API_SECRET as string,
});

// Define interface for request body
interface RequestBody {
  useremail: string;
  details: object;
}

// Define the POST handler
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await req.json();
    const { useremail, details }: RequestBody = body;
    
    console.log(body);
    
    const payment_capture = 1;
    const amount = 1 * 5000; // Amount in paisa. In this case, INR 1
    const currency = "INR";
    
    // Define order options type explicitly
    const options = {
      amount: amount.toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
      notes: {
        paymentFor: "Fresheresume",
        userId: "100",
        productId: "P100",
        userEmail: useremail,
      },
    };
    
    // Create Razorpay order
    const order = await instance.orders.create(options);
    
    // Return a successful response with the order details
    return NextResponse.json({ msg: "success", order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    // Return an error response if something goes wrong
    return NextResponse.json(
      { msg: "Error creating Razorpay order", error: (error as Error).message },
      { status: 500 }
    );
  }
}