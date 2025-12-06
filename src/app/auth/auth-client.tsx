"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp, signInSocial } from "@/lib/actions/auth-actions";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import { BookOpen, MessageSquare, Sparkles, Zap, Brain, FileText } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function AuthClientPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // Client-side session check - runs after component mounts (cookies are cleared by then)
  useEffect(() => {
    // Wait longer for cookies to be cleared after signOut
    // Check multiple times to ensure session is actually cleared
    let checkCount = 0;
    const maxChecks = 5; // Check up to 5 times (2.5 seconds total)
    
    const checkSession = () => {
      checkCount++;
      
      if (!sessionLoading) {
        if (session) {
          // If we've checked multiple times and still have session, user is actually logged in
          if (checkCount >= maxChecks) {
            // User is actually logged in, redirect to dashboard
            router.push("/dashboard");
            return;
          }
          // Session still exists, check again after delay
          setTimeout(checkSession, 500);
        } else {
          // No session found, user is logged out - show auth page
          setCheckingSession(false);
        }
      } else {
        // Still loading, check again
        setTimeout(checkSession, 500);
      }
    };

    // Start checking after initial delay
    const timer = setTimeout(checkSession, 500);

    return () => clearTimeout(timer);
  }, [session, sessionLoading, router]);

  const handleSocialAuth = async (provider: "google") => {
    setIsLoading(true);
    setError("");

    try {
      await signInSocial(provider);
    } catch (err) {
      setError(
        `Error authenticating with ${provider}: ${err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignIn) {
        // Use server action which handles captcha verification and sets cookies
        const result = await signIn(email, password, captchaToken);
        if (result.user) {
          toast.success("Signed in successfully");
          // Use window.location for full page reload to ensure session cookie is sent
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 300);
        } else {
          setError(result.error || "Invalid email or password");
          setIsLoading(false);
        }
      } else {
        // Use server action which handles captcha verification and sets cookies
        const result = await signUp(email, password, name, captchaToken);
        if (result.user) {
          toast.success("Account created successfully");
          // Use window.location for full page reload to ensure session cookie is sent
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 300);
        } else {
          setError(result.error || "Failed to create account");
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError(
        `Authentication error: ${err instanceof Error ? err.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (checkingSession || sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                NotebookLama
              </h1>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your AI-Powered Knowledge Companion
            </h2>

            <p className="text-xl text-gray-600 mb-12">
              Transform your notebooks into intelligent conversations. Chat with your notes,
              get instant insights, and unlock the full potential of your knowledge base.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <MessageSquare className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Natural Conversations</h3>
                  <p className="text-gray-600">Chat naturally with your notebooks using advanced AI technology</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <Brain className="w-6 h-6 text-fuchsia-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Intelligent Insights</h3>
                  <p className="text-gray-600">Get smart summaries and contextual answers from your content</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast Search</h3>
                  <p className="text-gray-600">Find any information across all your notebooks instantly</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <FileText className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Rich Document Support</h3>
                  <p className="text-gray-600">Upload PDFs, documents, and notes in any format</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                NotebookLama
              </h1>
            </div>

            {/* Auth Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-900">AI-Powered Notebooks</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignIn ? "Welcome Back" : "Get Started"}
                </h2>
                <p className="text-gray-600">
                  {isSignIn
                    ? "Continue your intelligent note-taking journey"
                    : "Start chatting with your notebooks today"}
                </p>
              </div>

              {/* Social Authentication */}
              <button
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}
                {!isSignIn && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required={!isSignIn}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Turnstile Captcha */}
                <div className="pt-2">
                  <Turnstile
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onVerify={(token) => setCaptchaToken(token)}
                    onError={() => {
                      setError("Captcha failed, please try again.");
                      setCaptchaToken(null);
                    }}
                    onExpire={() => setCaptchaToken(null)}
                    refreshExpired="auto"
                    theme="light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !captchaToken}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isSignIn ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isSignIn ? "Sign In" : "Create Account"}
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle between Sign In and Sign Up */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-sm text-gray-600">
                  {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignIn(!isSignIn);
                      setError("");
                    }}
                    className="font-semibold text-violet-600 hover:text-fuchsia-600 transition-colors"
                  >
                    {isSignIn ? "Sign up free" : "Sign in"}
                  </button>
                </p>
                {isSignIn && (
                  <p className="text-sm text-gray-600">
                    Forgot your password?{" "}
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-violet-600 hover:text-fuchsia-600 transition-colors"
                    >
                      Reset it here
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secured with enterprise-grade encryption · 🚀 Join 10,000+ users
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}