import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("[TEST WEBHOOK] Received test webhook request");
  
  try {
    const body = await request.text();
    console.log("[TEST WEBHOOK] Request body:", body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test webhook received",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[TEST WEBHOOK] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 