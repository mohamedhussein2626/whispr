import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/utils/auth-admin";

export async function POST() {
  try {
    const cookiesStore = await cookies();
    const admin_token = cookiesStore.get("admin_token")?.value;

    if (!admin_token) {
      return NextResponse.json(
        { message: " No Token Provided" },
        { status: 400 },
      );
    }

    verifyToken(admin_token);
    const res = NextResponse.json({ message: "Logged out successfully" });
    res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
    return res;
  } catch (error) {
    console.log("Logout Error :", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}