import { NextResponse } from "next/server";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = cookies(); // ✅ fixed
    const token = (await cookieStore).get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({
        message: "No Token Provided Yet",
        admin: null,
      });
    }

    const secret = process.env.JWT_SECRET!;
    let decoded: { adminId: number; email: string };

    try {
      decoded = jwt.verify(token, secret) as { adminId: number; email: string };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return NextResponse.json({
          message: "Token Expired",
          expired: true,
          admin: null,
        });
      }
      return NextResponse.json({ message: "Invalid Token", admin: null });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json({
        message: "Failed To Login To Admin Account. Kindly Try Again.",
        admin: null,
      });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ message: "Internal Server Error", admin: null });
  }
}