"use client";

import { useEffect } from "react";
import Script from "next/script";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

interface GtagFunction {
  (...args: unknown[]): void;
  q?: unknown[];
}


export default function SEOHead({
  title = "NotebookLama – Chat with Your PDFs Instantly",
  description = "NotebookLama is an AI-powered tool that lets you upload and chat with PDF documents. Ask questions, get instant answers, and explore files smarter than ever.",
  image = "https://app.notebooklama.com/og-image.jpg",
  url = "https://app.notebooklama.com",
  type = "website",
  siteName = "NotebookLama",
  faqs = [],
}: SEOHeadProps) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window !== "undefined") {
      if (!window.gtag) {
        const gtagFn: GtagFunction = function (...args: unknown[]) {
          gtagFn.q = gtagFn.q || [];
          gtagFn.q.push(args);
        };
        window.gtag = gtagFn;
      }
  
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID);
    }
  }, [GA_MEASUREMENT_ID]);
  
  
  // Generate FAQ schema
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: url,
    description: description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: url,
    logo: `${url}/logo.png`,
    description: description,
    sameAs: [
      "https://twitter.com/notebooklama",
      "https://github.com/notebooklama",
    ],
  };

  return (
    <>
      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_title: '${title}',
                page_location: '${url}',
              });
            `}
          </Script>
        </>
      )}

      {/* Google Search Console Verification */}
      <meta
        name="google-site-verification"
        content="your-google-search-console-verification-code"
      />

      {/* Bing Webmaster Verification */}
      <meta
        name="msvalidate.01"
        content="your-bing-webmaster-verification-code"
      />

      {/* OpenGraph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@notebooklama" />
      <meta name="twitter:creator" content="@notebooklama" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="NotebookLama" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Schema Markup */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
