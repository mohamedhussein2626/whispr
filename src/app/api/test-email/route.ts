import { NextRequest, NextResponse } from "next/server";
import { testEmailConnection, sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { action, email, name } = await req.json();

    switch (action) {
      case "test-connection":
        const connectionResult = await testEmailConnection();
        return NextResponse.json(connectionResult);

      case "test-welcome":
        if (!email || !name) {
          return NextResponse.json(
            { success: false, error: "Email and name are required" },
            { status: 400 }
          );
        }
        const welcomeResult = await sendWelcomeEmail(email, name);
        return NextResponse.json(welcomeResult);

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
