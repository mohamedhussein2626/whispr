import { NextResponse } from "next/server";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { AdminRegisterSchema } from "@/app/lib/schemas/admin";

import { generateAdminToken } from "@/app/lib/utils/auth-admin";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const scryptAsync = promisify(scrypt);

// Hash password with salt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = AdminRegisterSchema.parse(body);

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "Email Already iN Use" });
    }

    const hashedPassword = await hashPassword(password);

    const createAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const token = await generateAdminToken({
      adminId: createAdmin.id,
      email: createAdmin.email,
      role: "admin",
    });

    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      createAdmin,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.log("Error Register To Admin", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}