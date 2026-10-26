import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// 1. Validate critical payment gateway environment variables at runtime 
// to fail fast if deployment variables are missing, rather than failing mid-transaction.
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('CRITICAL: Razorpay environment variables are missing from .env');
}

// 2. Initialize the Razorpay instance globally outside the handler 
// so the connection is reused across serverless function invocations.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    // 3. Parse the incoming request payload safely
    const body = await req.json();
    const { amount, currency = 'INR' } = body;

    // 4. Strictly validate the transaction amount to prevent invalid or malicious requests
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'A valid transaction amount greater than 0 is required.' },
        { status: 400 }
      );
    }

    // 5. Construct the Razorpay order payload (converting INR to paise: 1 INR = 100 paise)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      // Added a random string to the receipt ID to prevent collisions 
      // if two users somehow trigger an order at the exact same millisecond
      receipt: `order_rcptid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
    };

    // 6. Create the order via the Razorpay API and return the data to the frontend
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    // 7. Handle and log internal API errors gracefully, ensuring strict TypeScript compliance
    console.error('Razorpay Order Creation Failed:', error);
    
    // Safely extract the error message without using 'any' types
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}