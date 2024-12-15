
import { dbConnection } from '@/app/lib/database';
import { UserLogin } from '@/app/lib/model';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();

    // Retrieve headers
    const razorpayEventType = req.headers.get('X-Razorpay-event-id') || '';
    const razorpaySignature = req.headers.get('X-Razorpay-signature') || '';
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE || '';

    // Verify Razorpay signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest('hex');

    if (razorpaySignature !== generatedSignature) {
      throw new Error('Invalid Razorpay signature');
    }

    // Parse the webhook payload
    const body = JSON.parse(rawBody);
    const notes = body.payload.order.entity.notes as { [key: string]: string };
    const userEmail = notes.userEmail;
    const credits = notes.credits;
    const email = notes.userEmail;

    // Event Handling
    if (body.event === 'order.paid') {
      const orderId = body.payload.order.entity.id;
      const status = body.payload.payment.entity.status;

      // Ensure the order is marked as "paid"
      if (status === 'captured') {
        // Connect to the database and update the user record
        await dbConnection();
        const user = await UserLogin.findOne({ email });

        if (user) {
          await UserLogin.updateOne({ email }, { credits: user.credits + credits });
        } else {
          console.error(`User not found for email: ${email}`);
        }
      }
    }

    // Respond to Razorpay
    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (err: any) {
    console.error('Error processing webhook:', err.message);
    return NextResponse.json(
      { message: 'Error processing webhook', error: err.message },
      { status: 500 }
    );
  }
}
