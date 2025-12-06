"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Mail, Lock, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminLoginSchema } from "@/app/lib/schemas/admin";

type LoginFormValues = {
  email: string;
  password: string;
};

export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Admin login successful! Redirecting to dashboard...");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("Invalid credentials. Please check your email and password.");
      console.error("Failed to login admin:", error);
      form.setError("root", {
        type: "manual",
        message: "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Admin Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="admin@notebooklama.com"
                    {...field}
                    className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Admin Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your secure password"
                    {...field}
                    className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs mt-1" />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </Button>

        <div className="pt-2 text-center">
          <p className="text-xs text-gray-500">
            Protected by advanced security protocols
          </p>
        </div>
      </form>
    </Form>
  );
}