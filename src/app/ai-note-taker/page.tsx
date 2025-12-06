"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Star, 
  ArrowRight, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  FileText, 
  Users, 
  Mic,
  Search,
  Share2
} from "lucide-react";
import Link from "next/link";
import FAQSection from "@/components/FAQSection";

const AINoteTaker = () => {
  const aiNoteTakerFAQs = [
    {
      question: "What is an AI Note Taker?",
      answer: "An AI Note Taker is an intelligent tool that automatically generates comprehensive notes from your documents using artificial intelligence. It extracts key information, creates summaries, and organizes content for easy reference and study."
    },
    {
      question: "How does the AI Note Taker work?",
      answer: "Simply upload your documents (PDF, DOC, DOCX, MD, TXT), and our AI analyzes the content to generate structured notes. You can then chat with your notes to get answers, clarifications, and deeper insights from the AI."
    },
    {
      question: "What types of documents can I use?",
      answer: "You can upload PDFs, Word documents (DOC, DOCX), Markdown files (MD), and text files (TXT). Our AI processes all these formats to create comprehensive notes and summaries."
    },
    {
      question: "How accurate are the AI-generated notes?",
      answer: "Our AI uses advanced language models to ensure high accuracy in note generation. The AI focuses on key concepts, important details, and maintains the context of your original documents while creating organized, readable notes."
    },
    {
      question: "Can I edit the AI-generated notes?",
      answer: "Yes, you can interact with your notes through our chat interface. Ask questions, request clarifications, or ask the AI to expand on specific topics. The AI will provide additional information and insights based on your original documents."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All your documents and notes are encrypted and stored securely. We follow industry best practices for data protection and privacy. Your information is never shared with third parties."
    }
  ];

  const features = [
    {
      title: "AI-Powered Note Generation",
      description: "Automatically generate comprehensive notes from your documents using advanced AI",
      icon: <Brain className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Multi-Format Document Support",
      description: "Upload PDFs, DOC, DOCX, MD, and TXT files to create notes from any document type",
      icon: <FileText className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Interactive Note Conversations",
      description: "Chat with your notes to get instant answers and deeper insights",
      icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
    },
    {
      title: "Smart Note Organization",
      description: "Automatically categorize and organize your notes for easy retrieval",
      icon: <Search className="w-6 h-6 text-orange-600" />,
    },
    {
      title: "Real-time Collaboration",
      description: "Share notes with team members and collaborate in real-time",
      icon: <Users className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: "Export & Share Options",
      description: "Export notes in multiple formats and share them easily",
      icon: <Share2 className="w-6 h-6 text-pink-600" />,
    },
  ];

  const useCases = [
    {
      title: "Student Note Taking",
      description: "Perfect for students who need to create comprehensive notes from textbooks, research papers, and lecture materials",
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Research Documentation",
      description: "Ideal for researchers who need to extract key insights from multiple research papers and documents",
      icon: <Search className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Meeting Notes",
      description: "Transform meeting transcripts and documents into actionable notes and summaries",
      icon: <Mic className="w-8 h-8 text-purple-600" />,
    },
    {
      title: "Content Creation",
      description: "Generate notes from source materials to create blog posts, articles, and content",
      icon: <FileText className="w-8 h-8 text-orange-600" />,
    },
  ];

  const benefits = [
    "Save 80% of your note-taking time",
    "Never miss important information",
    "Create comprehensive summaries automatically",
    "Access your notes from anywhere",
    "Collaborate with team members",
    "Export notes in multiple formats",
    "Search through all your notes instantly",
    "Get AI-powered insights from your notes",
  ];

  const steps = [
    {
      step: "1",
      title: "Upload Your Document",
      description: "Upload any PDF, DOC, DOCX, MD, or TXT file to get started",
    },
    {
      step: "2",
      title: "AI Processing",
      description: "Our AI analyzes your document and extracts key information",
    },
    {
      step: "3",
      title: "Generate Notes",
      description: "Get comprehensive, well-structured notes automatically generated",
    },
    {
      step: "4",
      title: "Chat & Refine",
      description: "Ask questions, get clarifications, and refine your notes through AI conversations",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              AI Note Taker App
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              The Ultimate AI Note Taker App
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Transform any document into comprehensive, interactive notes with AI. 
              Save time, never miss important information, and create better notes than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                <Link href="/dashboard">
                  Start Taking Notes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful AI Note Taking Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, organize, and interact with your notes using AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
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

      {/* Use Cases Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect for Every Note Taking Need
            </h2>
            <p className="text-lg text-gray-600">
              Whether you&apos;re a student, researcher, or professional, our AI note taker has you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {useCase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Note Taker?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the benefits of AI-powered note taking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started with AI note taking in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Users Say About Our AI Note Taker
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied users who transformed their note taking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;This AI note taker has revolutionized how I study. 
                  I can now create comprehensive notes from textbooks in minutes instead of hours.&quot;
                </p>
                <div className="font-semibold">Jessica Martinez</div>
                <div className="text-sm text-gray-500">Medical Student</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;As a researcher, I deal with dozens of papers daily. 
                  This tool helps me extract key insights and create organized notes effortlessly.&quot;
                </p>
                <div className="font-semibold">Dr. Robert Kim</div>
                <div className="text-sm text-gray-500">Research Scientist</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;The AI conversations feature is incredible. 
                  I can ask questions about my notes and get instant, accurate answers.&quot;
                </p>
                <div className="font-semibold">Amanda Foster</div>
                <div className="text-sm text-gray-500">Content Creator</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Affordable AI Note Taking
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your note taking needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    10 AI-generated notes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Basic note templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    PDF and text file support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-emerald-600 border-2">
              <CardHeader>
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="text-3xl font-bold">$9.99<span className="text-lg">/month</span></div>
                <CardDescription>For serious note takers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Unlimited AI-generated notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    All document formats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Advanced AI conversations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Team collaboration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Max</CardTitle>
                <div className="text-3xl font-bold">$19.99<span className="text-lg">/month</span></div>
                <CardDescription>For power users</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Priority AI processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    API access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection 
        faqs={aiNoteTakerFAQs} 
        title="AI Note Taker FAQs"
        description="Common questions about our AI-powered note taking tool"
      />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Start Taking Better Notes Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who transformed their note taking with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/pricing">
                View All Plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINoteTaker;
