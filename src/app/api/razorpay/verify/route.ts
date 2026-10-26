import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// 1. Define the absolute path for the local JSON database securely
const DB_FILE_PATH = path.join(process.cwd(), 'orders.json');

export async function POST(req: Request) {
  try {
    // 2. Validate the presence of the Razorpay secret to prevent runtime crashes
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error('CRITICAL: RAZORPAY_KEY_SECRET environment variable is missing.');
    }

    // 3. Extract the payment and order payload from the request body
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body;

    // 4. Generate the HMAC SHA256 signature to verify payload authenticity
    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureBody)
      .digest('hex');

    // 5. Compare signatures and reject unauthorized or tampered requests immediately
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // 6. Map and structure the completed order data with safe fallbacks
    const completedOrder = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      verifiedAt: new Date().toISOString(),
      status: 'PAID',
      customer: {
        name: orderDetails?.customer?.name || 'N/A',
        email: orderDetails?.customer?.email || 'N/A',
        phone: orderDetails?.customer?.phone || 'N/A',
        address: orderDetails?.customer?.address || 'N/A',
      },
      items: orderDetails?.items || [],
      totalAmount: orderDetails?.totalAmount || 0,
    };

    // 7. Safely read existing orders from the local JSON file
    let orders = [];
    try {
      const fileData = await fs.readFile(DB_FILE_PATH, 'utf-8');
      orders = JSON.parse(fileData);
    } catch (error) {
      // 8. Use strict type narrowing to handle Node.js file system errors
      const fsError = error as NodeJS.ErrnoException;
      
      // If the error is NOT "File Not Found" (ENOENT), throw it. 
      // If it IS "File Not Found", we proceed with the empty array.
      if (fsError.code !== 'ENOENT') {
        throw error; 
      }
    }

    // 9. Append the new order and persist it back to the file system
    orders.push(completedOrder);
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');

    // 10. Return a success response confirming verification and storage
    return NextResponse.json({
      success: true,
      message: 'Payment verified and order saved locally',
      order: completedOrder,
    });
    
  } catch (error) {
    // 11. Gracefully catch and log any server or parsing errors without using 'any'
    console.error('Payment verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}