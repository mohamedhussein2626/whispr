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
  MessageSquare,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import FAQSection from "@/components/FAQSection";

const NotebookLMAlternative = () => {
  const notebooklmFAQs = [
    {
      question: "How does NotebookLama compare to Google's NotebookLM?",
      answer:
        "NotebookLama offers superior features including multi-format support (PDF, DOC, DOCX, MD, TXT), unlimited document storage, team collaboration, API access, and custom AI prompts. We provide better value with more affordable pricing and enhanced functionality.",
    },
    {
      question: "Can I import my NotebookLM documents?",
      answer:
        "Yes, you can easily export your documents from NotebookLM and upload them to NotebookLama. Our AI will analyze them and provide better conversation capabilities with your existing documents.",
    },
    {
      question: "Is NotebookLama more expensive than NotebookLM?",
      answer:
        "No, NotebookLama offers better value with our Pro plan at $9.99/month compared to NotebookLM's $19.99/month. We provide more features at a lower cost with better performance and capabilities.",
    },
    {
      question: "Does NotebookLama have better AI than NotebookLM?",
      answer:
        "NotebookLama uses advanced AI models that provide more accurate and contextual responses. Our AI conversations are more intuitive and helpful, with better document analysis capabilities than NotebookLM.",
    },
    {
      question: "What makes NotebookLama better than NotebookLM?",
      answer:
        "NotebookLama offers multi-format support, unlimited document storage, team collaboration features, API access, custom AI prompts, and better pricing. We provide a more comprehensive solution for document AI analysis.",
    },
  ];

  const advantages = [
    {
      title: "Superior AI Conversations",
      description:
        "Advanced AI models that provide more accurate and contextual responses to your document queries",
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Multi-Format Document Support",
      description:
        "Support for PDFs, DOC, DOCX, MD, and TXT files - more formats than NotebookLM",
      icon: <FileText className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Real-time Collaboration",
      description:
        "Share documents and collaborate with team members in real-time",
      icon: <Users className="w-6 h-6 text-purple-600" />,
    },
    {
      title: "Lightning Fast Processing",
      description:
        "Optimized performance that processes documents faster than NotebookLM",
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
    },
  ];

  const comparison = [
    {
      feature: "AI Document Conversations",
      notebooklama: true,
      notebooklm: true,
    },
    {
      feature: "Multi-Format Support (PDF, DOC, DOCX, MD, TXT)",
      notebooklama: true,
      notebooklm: false,
    },
    {
      feature: "Real-time Chat Interface",
      notebooklama: true,
      notebooklm: true,
    },
    {
      feature: "Advanced AI Models",
      notebooklama: true,
      notebooklm: true,
    },
    {
      feature: "Unlimited Document Storage",
      notebooklama: true,
      notebooklm: false,
    },
    {
      feature: "Team Collaboration",
      notebooklama: true,
      notebooklm: false,
    },
    {
      feature: "API Access",
      notebooklama: true,
      notebooklm: false,
    },
    {
      feature: "Custom AI Prompts",
      notebooklama: true,
      notebooklm: false,
    },
  ];

  const pricingComparison = [
    {
      plan: "Free Plan",
      notebooklama: "Unlimited documents, 10 chats/month",
      notebooklm: "Limited documents, 5 chats/month",
    },
    {
      plan: "Pro Plan",
      notebooklama: "$9.99/month - Unlimited everything",
      notebooklm: "$19.99/month - Limited features",
    },
    {
      plan: "Enterprise",
      notebooklama: "Custom pricing with full features",
      notebooklm: "Contact sales - Limited customization",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Best NotebookLM Alternative
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              NotebookLama: The Superior NotebookLM Alternative
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Experience next-generation AI document analysis with features that
              surpass NotebookLM. Get better performance, more formats, and
              superior AI conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Link href="/pricing">Compare Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose NotebookLama Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why NotebookLama is Better Than NotebookLM
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the advantages that make NotebookLama the preferred choice
            for AI document analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-center mb-4">{advantage.icon}</div>
                <CardTitle className="text-lg">{advantage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {advantage.description}
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
              NotebookLama vs NotebookLM: Detailed Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See how we outperform Google&apos;s NotebookLM in every aspect
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
                        NotebookLM
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
                          {item.feature.replace(/'/g, "&apos;")}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.notebooklama ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.notebooklm ? (
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

      {/* Pricing Comparison */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Better Value, Better Features
            </h2>
            <p className="text-lg text-gray-600">
              Get more for less with NotebookLama&apos;s competitive pricing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingComparison.map((plan, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {plan.plan.replace(/"/g, "&quot;")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      NotebookLama
                    </h4>
                    <p className="text-sm text-green-700">
                      {plan.notebooklama}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">
                      NotebookLM
                    </h4>
                    <p className="text-sm text-red-700">
                      {plan.notebooklm.replace(/"/g, "&quot;")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories from NotebookLM Migrants
            </h2>
            <p className="text-lg text-gray-600">
              See why users are switching from NotebookLM to NotebookLama&apos;s
              platform
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
                  &quot;NotebookLama&apos;s multi-format support was a
                  game-changer. I can now work with all my document types in one
                  place.&quot;
                </p>
                <div className="font-semibold">Dr. James Wilson</div>
                <div className="text-sm text-gray-500">Research Scientist</div>
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
                  &quot;The AI conversations are much more accurate than
                  NotebookLM. Plus, the pricing is unbeatable for the features
                  offered.&quot;
                </p>
                <div className="font-semibold">Lisa Thompson</div>
                <div className="text-sm text-gray-500">Content Manager</div>
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
                  &quot;Switched from NotebookLM and never looked back. The team
                  collaboration features alone make it worth it.&quot;
                </p>
                <div className="font-semibold">Alex Rodriguez</div>
                <div className="text-sm text-gray-500">Project Manager</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Migration Benefits */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Easy Migration from NotebookLM
            </h2>
            <p className="text-xl opacity-90">
              Switch seamlessly with our migration tools and support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Import Your Documents
              </h3>
              <p className="opacity-90">
                Easily transfer all your NotebookLM documents to NotebookLama
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Enhanced AI Experience
              </h3>
              <p className="opacity-90">
                Experience superior AI conversations and document analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="opacity-90">
                Share and collaborate on documents with your team members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection
        faqs={notebooklmFAQs}
        title="NotebookLM Alternative FAQs"
        description="Common questions about switching from Google's NotebookLM to NotebookLama"
      />

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Upgrade from NotebookLM?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who made the smart switch to NotebookLama
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookLMAlternative;
