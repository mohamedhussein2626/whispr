

import { NextResponse } from "next/server";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { AdminLoginSchema } from "@/app/lib/schemas/admin";
import { PrismaClient } from "@prisma/client";
import { generateAdminToken } from "@/app/lib/utils/auth-admin";

const prisma = new PrismaClient();

const scryptAsync = promisify(scrypt);

// ─── Password Verification ────────────────────────────────────────────────────

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    const [salt, key] = hash.split(":");
    const saltBuffer = Buffer.from(salt, "hex");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = (await scryptAsync(password, saltBuffer, 64)) as Buffer;
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

async function dummyVerify(password: string): Promise<void> {
  const dummySalt = randomBytes(32);
  await scryptAsync(password, dummySalt, 64);
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = AdminLoginSchema.parse(body);

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!admin) {
      await dummyVerify(password);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const admin_token = await generateAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: "admin",
    });

    const response = NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("admin_token", admin_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Admin Error", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}