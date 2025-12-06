"use client";
import Link from "next/link";
import { BookOpen, Shield, Lock, Sparkles } from "lucide-react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Branding and Admin Info */}
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

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-900">Admin Portal</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Administrative Dashboard Access
            </h2>
            
            <p className="text-xl text-gray-600 mb-12">
              Manage your NotebookLama platform, monitor user activity, and configure 
              AI-powered features from your secure admin dashboard.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <Shield className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
                  <p className="text-gray-600">Control user accounts, permissions, and access levels</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-fuchsia-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Configuration</h3>
                  <p className="text-gray-600">Adjust AI models, parameters, and conversation settings</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Security & Analytics</h3>
                  <p className="text-gray-600">Monitor system health, usage metrics, and security logs</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Content Moderation</h3>
                  <p className="text-gray-600">Review notebooks, manage content, and ensure quality</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-violet-100">
              <p className="text-sm text-gray-600 mb-2">
                <strong className="text-gray-900">Note:</strong> This is a secure administrative area.
              </p>
              <p className="text-sm text-gray-600">
                All login attempts are monitored and logged for security purposes. 
                Only authorized administrators should access this portal.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
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

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative">
              {/* Back to home link */}
              <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Home
              </Link>

              <div className="text-center mb-8 mt-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 px-4 py-2 rounded-full mb-4">
                  <Shield className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-900">Admin Access</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back, Admin
                </h2>
                <p className="text-gray-600">
                  Sign in to access your administrative dashboard
                </p>
              </div>

              {/* Login form */}
              <AdminLoginForm />

              {/* Security notice */}
              <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Secure Login</p>
                    <p className="text-xs text-gray-600">
                      Your credentials are encrypted and all sessions are monitored. 
                      Never share your admin credentials with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile security notice */}
            <div className="lg:hidden mt-6 text-center">
              <p className="text-xs text-gray-600">
                🔒 Secured with enterprise-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}