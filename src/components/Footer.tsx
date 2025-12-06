"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Shield,
  Mail,
  Twitter,
  Github,
  Linkedin,
  Heart,
} from "lucide-react";

export default function WhisprPDFFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800  overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Reduced padding */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand Section - More compact */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="NotebookLama Logo"
                width={60}
                height={54}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-white">NotebookLama</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Transform your PDF experience with AI-powered conversations.
            </p>
            <div className="flex space-x-3">
              <Link
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product Links - Compact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Product</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-3 w-3" />
                  <span>PDF Chat</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links - Compact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Support</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-3 w-3" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links - Compact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Company</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <Shield className="h-3 w-3" />
                  <span>Privacy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate"
                  className="hover:text-blue-400 transition-colors font-bold"
                >
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Reduced padding */}
        <div className="py-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-xs">
              © 2025 NotebookLama. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500" />
              <span>for Students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
