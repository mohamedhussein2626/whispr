"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  description?: string;
}

export default function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about NotebookLama",
}: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <Collapsible>
                <CollapsibleTrigger
                  onClick={() => toggleItem(index)}
                  className="w-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 hover:bg-gray-50 transition-colors">
                    <CardTitle className="text-left text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </CardTitle>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openItems.includes(index) ? "rotate-180" : ""
                      }`}
                    />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// FAQ data for different pages
export const homepageFAQs: FAQ[] = [
  {
    question: "What is NotebookLama?",
    answer:
      "NotebookLama is an AI-powered tool that allows you to upload PDF documents and chat with them using advanced artificial intelligence. You can ask questions, get summaries, and extract insights from your documents instantly.",
  },
  {
    question: "How does the AI chat with PDFs work?",
    answer:
      "Our AI analyzes your uploaded PDF documents and creates a searchable knowledge base. You can then ask questions in natural language, and the AI will provide accurate answers based on the content of your documents.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "Currently, we support PDF files, and we're working on adding support for DOC, DOCX, MD, and TXT files. You can upload multiple files and chat with all of them simultaneously.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security seriously. All files are encrypted in transit and at rest. We use secure cloud storage and follow industry best practices to protect your documents and conversations.",
  },
  {
    question: "How much does NotebookLama cost?",
    answer:
      "We offer a free plan with limited uploads, a Pro plan at $9.99/month with more features, and a Max plan at $19.99/month with unlimited access. All plans include our core AI chat functionality.",
  },
  {
    question: "Can I use NotebookLama for commercial purposes?",
    answer:
      "Yes, our Pro and Max plans are designed for commercial use. You can use NotebookLama for business documents, research, education, and any other professional applications.",
  },
];

export const pricingFAQs: FAQ[] = [
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan includes 3 file uploads, basic AI chat functionality, and access to our core features. It's perfect for trying out NotebookLama and getting started with AI-powered document analysis.",
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle. You'll only be charged the prorated difference.",
  },
  {
    question: "Do you offer annual billing discounts?",
    answer:
      "Yes, we offer significant discounts for annual subscriptions. Annual plans typically save you 20% compared to monthly billing. Check our pricing page for current annual pricing.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer:
      "If you exceed your file upload limit, you'll need to upgrade to a higher plan or delete some files to free up space. We'll notify you when you're approaching your limits.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with NotebookLama, contact our support team for a full refund within 30 days of your purchase.",
  },
  {
    question: "Do you offer enterprise plans?",
    answer:
      "Yes, we offer custom enterprise plans for large organizations. These include advanced features, dedicated support, custom integrations, and volume discounts. Contact our sales team for more information.",
  },
];

export const affiliateFAQs: FAQ[] = [
  {
    question: "How does the affiliate program work?",
    answer:
      "Our affiliate program pays 30% commission on every subscription you refer. When someone signs up through your referral link and subscribes to a paid plan, you earn a commission on their subscription.",
  },
  {
    question: "How much can I earn as an affiliate?",
    answer:
      "You earn 30% commission on all referred subscriptions. For example, if you refer someone who subscribes to our Pro plan ($9.99/month), you'll earn approximately $3 per month for as long as they remain subscribed.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Commissions are paid monthly via PayPal or bank transfer. Payments are processed within 30 days of the end of each month, provided you've reached the minimum payout threshold.",
  },
  {
    question: "How do I track my referrals?",
    answer:
      "You'll have access to a comprehensive dashboard showing your referral statistics, commission earnings, and payment history. You can track clicks, conversions, and earnings in real-time.",
  },
  {
    question: "Are there any restrictions on how I promote NotebookLama?",
    answer:
      "We encourage honest and ethical promotion. You cannot use spam, misleading claims, or violate any platform's terms of service. We reserve the right to terminate accounts that violate our affiliate terms.",
  },
  {
    question: "How do I get started as an affiliate?",
    answer:
      "Simply sign up for our affiliate program through your dashboard. Once approved, you'll receive your unique referral links and can start promoting NotebookLama to earn commissions.",
  },
];
