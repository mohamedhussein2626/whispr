import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

function ResetPasswordContent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          Better Auth Starter
        </Link>
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}