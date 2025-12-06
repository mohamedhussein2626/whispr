import { auth } from "@/lib/auth";
import AuthClientPage from "./auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ signout?: string }>;
}) {
  const params = await searchParams;
  // If signout parameter is present, bypass session check (user just signed out)
  if (params?.signout === "true") {
    return <AuthClientPage />;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <AuthClientPage />;
}