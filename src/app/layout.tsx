import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import ConditionalNavbar from "@/components/ConditionalNavbar";
import Providers from "@/components/Providers"; // ✅ import Providers
import ConditionalFooter from "@/components/ConditionalFooter";
import SEOHead from "@/components/SEOHead";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "NotebookLama – Chat with Your PDFs Instantly",
  description:
    "NotebookLama is an AI-powered tool that lets you upload and chat with PDF documents. Ask questions, get instant answers, and explore files smarter than ever.",
  keywords: "AI PDF chat, document analysis, PDF reader, AI assistant, document Q&A, PDF questions, AI tool, document processing",
  authors: [{ name: "NotebookLama Team" }],
  creator: "NotebookLama",
  publisher: "NotebookLama",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://app.notebooklama.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NotebookLama – Chat with Your PDFs Instantly",
    description: "NotebookLama is an AI-powered tool that lets you upload and chat with PDF documents. Ask questions, get instant answers, and explore files smarter than ever.",
    url: 'https://app.notebooklama.com',
    siteName: 'NotebookLama',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NotebookLama - AI PDF Chat Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NotebookLama – Chat with Your PDFs Instantly",
    description: "NotebookLama is an AI-powered tool that lets you upload and chat with PDF documents. Ask questions, get instant answers, and explore files smarter than ever.",
    images: ['/og-image.jpg'],
    creator: '@notebooklama',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-search-console-verification-code',
    other: {
      'msvalidate.01': 'your-bing-webmaster-verification-code',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <SEOHead />
      </head>
      <body className={`${fontSans.variable} font-sans antialiased h-full`}>
        <Toaster richColors position="top-right" />
        <Providers>
          {" "}
          {/* ✅ tRPC/React Query context wrapper */}
          <ConditionalNavbar />
          {children}
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
