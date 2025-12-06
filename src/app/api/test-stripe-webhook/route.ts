import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Stripe webhook endpoint is accessible",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  console.log("[TEST STRIPE WEBHOOK] POST request received");
  
  try {
    const body = await request.text();
    console.log("[TEST STRIPE WEBHOOK] Body:", body.substring(0, 200) + "...");
    
    return NextResponse.json({ 
      success: true, 
      message: "Test POST to Stripe webhook endpoint successful",
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[TEST STRIPE WEBHOOK] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 