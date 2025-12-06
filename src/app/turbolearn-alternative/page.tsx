"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
  BookOpen,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";
import FAQSection from "@/components/FAQSection";

const TurboLearnAlternative = () => {
  const turbolearnFAQs = [
    {
      question: "How is NotebookLama different from TurboLearn?",
      answer:
        "NotebookLama offers AI-powered conversations with your documents, multi-format support (PDF, DOC, DOCX, MD, TXT), and real-time chat interface. Unlike TurboLearn, we provide unlimited document storage and advanced AI models for better document analysis.",
    },
    {
      question: "Can I migrate my data from TurboLearn?",
      answer:
        "Yes, you can easily export your documents from TurboLearn and upload them to NotebookLama. Our AI will analyze them and you can start chatting with your documents immediately.",
    },
    {
      question: "Is NotebookLama more expensive than TurboLearn?",
      answer:
        "NotebookLama offers better value with our Pro plan at $9.99/month compared to TurboLearn's pricing. We provide more features, better AI capabilities, and unlimited document storage in our higher-tier plans.",
    },
    {
      question: "Does NotebookLama have the same features as TurboLearn?",
      answer:
        "NotebookLama has all the core features of TurboLearn plus additional capabilities like multi-format support, real-time collaboration, and advanced AI conversations. We offer a superior user experience with better performance.",
    },
    {
      question: "How do I get started with NotebookLama?",
      answer:
        "Simply sign up for a free account, upload your documents, and start chatting with them using our AI. You can try all features with our free plan before upgrading to a paid subscription.",
    },
  ];

  const features = [
    {
      title: "AI-Powered PDF Conversations",
      description:
        "Chat with your PDFs using advanced AI to get instant answers and insights",
      icon: <Brain className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Multi-Format Support",
      description:
        "Upload PDFs, DOC, DOCX, MD, and TXT files for comprehensive document analysis",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Lightning Fast Processing",
      description:
        "Get instant responses and summaries with our optimized AI engine",
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
    },
  ];

  const comparison = [
    {
      feature: "AI-Powered Conversations",
      notebooklama: true,
      turbolearn: false,
    },
    {
      feature: "PDF Document Analysis",
      notebooklama: true,
      turbolearn: true,
    },
    {
      feature: "Multi-Format Support",
      notebooklama: true,
      turbolearn: false,
    },
    {
      feature: "Real-time Chat Interface",
      notebooklama: true,
      turbolearn: false,
    },
    {
      feature: "Advanced AI Models",
      notebooklama: true,
      turbolearn: true,
    },
    {
      feature: "Unlimited Document Storage",
      notebooklama: true,
      turbolearn: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Best TurboLearn Alternative
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              NotebookLama: The Ultimate TurboLearn Alternative
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Transform your document workflow with AI-powered conversations.
              Get instant answers, summaries, and insights from your PDFs and
              documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose NotebookLama Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose NotebookLama Over TurboLearn?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the next generation of document AI with features that
            TurboLearn simply can&apos;t match
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              NotebookLama vs TurboLearn: Feature Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See how we stack up against the competition
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        NotebookLama
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        TurboLearn
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparison.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.notebooklama ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.turbolearn ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied users who made the switch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;NotebookLama has completely transformed how I work with
                  documents. The AI conversations are incredibly intuitive and
                  helpful.&quot;
                </p>

                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Research Analyst</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;Switched from TurboLearn and never looked back. The
                  multi-format support and real-time chat are game-changers.&quot;
                </p>
                <div className="font-semibold">Michael Chen</div>
                <div className="text-sm text-gray-500">Student</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;The AI-powered conversations make document analysis so much
                  easier. Highly recommend for anyone working with PDFs
                  regularly.&quot;
                </p>
                <div className="font-semibold">Emily Rodriguez</div>
                <div className="text-sm text-gray-500">Content Creator</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection
        faqs={turbolearnFAQs}
        title="TurboLearn Alternative FAQs"
        description="Common questions about switching from TurboLearn to NotebookLama"
      />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Make the Switch?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who chose NotebookLama as their TurboLearn
            alternative
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurboLearnAlternative;
