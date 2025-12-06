
"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";
import { useSession } from "@/lib/auth-client";

import Image from "next/image";

import {
  Info,
  Home,
  DollarSign,
} from "lucide-react";

const Navbar = () => {
  const { data: session, isPending } = useSession();

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <nav className="sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
        <MaxWidthWrapper>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 z-40">
              <Image
                src="/logo.png"
                alt="NotebookLama Logo"
                width={32}
                height={24}
                className="rounded-sm"
              />
              <span className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors duration-200">
                NotebookLama
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </MaxWidthWrapper>
      </nav>
    );
  }

  return (
    <nav className="sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-40">
            <Image
              src="/logo.png"
              alt="NotebookLama Logo"
              width={32}
              height={24}
              className="rounded-sm"
            />
            <span className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors duration-200">
              NotebookLama
            </span>
          </Link>

          {!session && (
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Info className="h-4 w-4" />
                About
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <DollarSign className="h-4 w-4" />
                Pricing
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
          {session ? (
            <Link
              href={"/dashboard"}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" className="text-gray-600">
                <Link href={"/auth"}>Login</Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href={"/auth"}>Create Account</Link>
              </Button>
            </>
          )}
        </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
