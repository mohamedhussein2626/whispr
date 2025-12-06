"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";
import { db } from "@/db"; // Use the shared db instance instead of creating a new one

async function verifyCaptcha(captchaToken: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY as string;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(
        secretKey
      )}&response=${encodeURIComponent(captchaToken)}`,
    }
  );

  const data = await response.json();
  return data.success as boolean;
}

export const signIn = async (
  email: string,
  password: string,
  captchaToken: string
) => {
  try {
    const isValid = await verifyCaptcha(captchaToken);
    if (!isValid) {
      return { user: null, error: "Captcha verification failed" };
    }

    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0] ||
      hdrs.get("x-real-ip") ||
      "Unknown";
    const userAgent = hdrs.get("user-agent") || null;

    const result = await auth.api.signInEmail({
      body: { email, password, callbackURL: "/dashboard" },
      headers: hdrs,
    });

    if (!result.user) {
      return { user: null, error: "Invalid email or password" };
    }

    // Update session with IP and user agent
    try {
      const latestSession = await db.session.findFirst({
        where: { userId: result.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestSession) {
        await db.session.update({
          where: { id: latestSession.id },
          data: { ipAddress: ip, userAgent },
        });
      }
    } catch (sessionError) {
      console.error("Session update error:", sessionError);
      // Don't fail the sign in if session update fails
    }

    return { user: result.user, error: null };
  } catch (err) {
    console.error("SignIn failed:", err);
    return { user: null, error: "Something went wrong while signing in" };
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  captchaToken: string
) => {
  try {
    const isValid = await verifyCaptcha(captchaToken);
    if (!isValid) {
      return { user: null, error: "Captcha verification failed" };
    }

    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0] ||
      hdrs.get("x-real-ip") ||
      "Unknown";
    const userAgent = hdrs.get("user-agent") || null;

    const result = await auth.api.signUpEmail({
      body: { email, password, name, callbackURL: "/dashboard" },
      headers: hdrs,
    });

    if (!result.user) {
      return { user: null, error: "Failed to create account" };
    }

    // Update session with IP and user agent
    try {
      const latestSession = await db.session.findFirst({
        where: { userId: result.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestSession) {
        await db.session.update({
          where: { id: latestSession.id },
          data: { ipAddress: ip, userAgent },
        });
      }
    } catch (sessionError) {
      console.error("Session update error:", sessionError);
      // Don't fail the sign up if session update fails
    }

    // Trigger welcome email in background (non-blocking)
    import("@/lib/email")
      .then(({ sendWelcomeEmail }) => {
        void sendWelcomeEmail(email, name);
      })
      .catch((emailError) => {
        console.error("Failed to schedule welcome email:", emailError);
      });

    return { user: result.user, error: null };
  } catch (err) {
    console.error("SignUp failed:", err);
    return { user: null, error: "Something went wrong while signing up" };
  }
};

export const signInSocial = async (provider: "google") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/dashboard",
    },
  });

  if (url) {
    redirect(url);
  }
};


export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};


export const forgotPassword = async (email: string) => {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "No account found with this email address" };
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
    
    // Update user's password in the database
    await db.user.update({
      where: { id: user.id },
      data: { password: tempPassword }, // Note: In production, you should hash this password
    });

    // Send email with the new password
    const { sendForgotPasswordEmail } = await import("@/lib/email");
    const emailResult = await sendForgotPasswordEmail(email, user.name, tempPassword);

    if (!emailResult.success) {
      console.error("Failed to send forgot password email:", emailResult.error);
      return { success: false, error: "Failed to send password reset email" };
    }

    return { success: true, message: "Password reset email sent successfully" };
  } catch (err) {
    console.error("Forgot password error:", err);
    return { success: false, error: "Something went wrong while processing your request" };
  }
};