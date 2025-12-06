import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Play,
  FileText,
  Users,
  Star,
  Brain,
  BookOpen,
  Headphones,
  HelpCircle,
  Lightbulb,
  Globe,
  Cloud,
  CheckSquare,
  Library,
  
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import PricingSection from "@/components/PricingSection";
import WatchDemoButton from "@/components/WatchDemoButton";
import FAQSection, { homepageFAQs } from "@/components/FAQSection";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  
  return (
    <>
      {/* Hero Section - Improved */}
      <MaxWidthWrapper className="mb-16 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        {/* Announcement Banner */}
        <div className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-green-200 bg-green-50 px-6 py-2 shadow-sm transition-all hover:shadow-md duration-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-medium text-green-800">
            NotebookLama is now public!
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-gray-900 mb-6">
          Transform your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            documents
          </span>{" "}
          into learning experiences
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-3xl text-lg text-gray-600 leading-relaxed mb-8">
          NotebookLama allows you to have conversations with any document - PDF, DOC, DOCX, TXT, MD files, or even webpages. Simply upload your file and start asking questions right away with our AI-powered chat interface. Plus, create quizzes, flashcards, transcripts, and listen to AI-generated podcasts from your content.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            className={buttonVariants({
              size: "lg",
              className:
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold",
            })}
            href="/dashboard"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          <WatchDemoButton />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
            <div className="text-sm text-gray-600 font-medium">Documents Processed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">50K+</div>
            <div className="text-sm text-gray-600 font-medium">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
            <div className="text-sm text-gray-600 font-medium">Uptime</div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Product Preview Section */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                  <Image
                    src="/dashboard-preview.png"
                    alt="product preview"
                    width={1364}
                    height={866}
                    quality={100}
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tools Section */}
      <div className="py-24 bg-gray-50">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Learning Tools */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Learning Tools</h2>
              </div>

              <div className="space-y-4">
                {/* AI-Generated Quiz */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Quiz</h3>
                      <p className="text-gray-600 mb-2">Upload your PDF and get personalized quiz questions based on the actual content</p>
                      <p className="text-sm text-blue-600 font-medium">Questions are generated specifically from your document</p>
                    </div>
                  </div>
                </div>

                {/* AI-Generated Flashcards */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Flashcards</h3>
                      <p className="text-gray-600 mb-2">Personalized Learning Cards</p>
                      <p className="text-sm text-green-600 font-medium">Flashcards created from your document content</p>
                    </div>
                  </div>
                </div>

                {/* Podcast Player */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Podcast Player</h3>
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-3">
                          <button className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          </button>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '43%' }}></div>
                            </div>
                            <div className="text-sm text-gray-600">2:15 / 5:00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Essay Writer */}
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Essay Writer</h3>
                      <p className="text-gray-600 mb-2">Generate high-quality essays from your document content</p>
                      <p className="text-sm text-indigo-600 font-medium">AI-powered essay generation with proper structure</p>
                    </div>
                  </div>
                </div>

        {/* AI Essay Grader */}
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Essay Grader</h3>
              <p className="text-gray-600 mb-2">Get instant feedback and grading for your essays</p>
              <p className="text-sm text-amber-600 font-medium">Comprehensive analysis with improvement suggestions</p>
            </div>
          </div>
        </div>

        {/* Library Feature */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Library className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Library</h3>
              <p className="text-gray-600 mb-2">Combine multiple notes in one topic </p>
              <p className="text-sm text-emerald-600 font-medium">Organize and merge your study materials</p>
            </div>
          </div>
        </div>
              </div>
            </div>

            {/* Right Side - AI Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transform Learning with AI</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Our advanced AI features help you learn more effectively by creating interactive content from your documents.
              </p>

              <div className="space-y-6">
                {/* Smart Quiz Generation */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Smart Quiz Generation</h3>
                    <p className="text-gray-600">AI creates relevant questions to test your understanding</p>
                  </div>
                </div>

                {/* Memory Enhancement */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Memory Enhancement</h3>
                    <p className="text-gray-600">Flashcards use spaced repetition for better retention</p>
                  </div>
                </div>

                {/* Structured Learning */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Structured Learning</h3>
                    <p className="text-gray-600">Transcripts organize information for easy review</p>
                  </div>
                </div>

                {/* Audio Learning */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Audio Learning</h3>
                    <p className="text-gray-600">Listen to documents while multitasking</p>
                  </div>
                </div>

                {/* AI Essay Writer */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Essay Writer</h3>
                    <p className="text-gray-600">Generate well-structured essays from your content</p>
                  </div>
                </div>

        {/* AI Essay Grader */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Essay Grader</h3>
            <p className="text-gray-600">Get instant feedback and grading for your essays</p>
          </div>
        </div>

        {/* Library Feature */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Library className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Library</h3>
            <p className="text-gray-600">Combine multiple notes in one topic</p>
          </div>
        </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Try All Features <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      {/* Comprehensive Features Section */}
      <div className="py-24 bg-white">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Every Learning Need</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how NotebookLama transforms your documents into interactive learning experiences
            </p>
          </div>

          {/* Feature 1: AI Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">AI Chat Interface</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Have natural conversations with your documents. Ask questions, get instant answers, and explore your content like never before.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Natural language processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Context-aware responses</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Multi-document conversations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Citation and source tracking</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">AI Assistant</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">What were some flaws in this paper?</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-gray-700">Some of the flaws in this paper include a lack of analysis of the data...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Multi-Format Support */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">PDF</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">DOC</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">TXT</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">MD</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Multi-Format Support</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Upload any document type and get instant AI analysis. From PDFs to Word docs, we support all major formats.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">PDF, DOC, DOCX support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Markdown and text files</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Webpage URL processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Batch file processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Advanced Learning Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Advanced Learning Tools</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Transform your documents into interactive learning experiences with quizzes, flashcards, and audio content.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">AI-generated quizzes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Smart flashcards</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Audio podcasts</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Transcript generation</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Quiz</span>
                    </div>
                    <p className="text-sm text-gray-600">5 questions generated</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Flashcards</span>
                    </div>
                    <p className="text-sm text-gray-600">12 cards created</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Headphones className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Podcast</span>
                    </div>
                    <p className="text-sm text-gray-600">8 minutes duration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: AI Writing Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-indigo-50 to-amber-50 rounded-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-gray-900">AI Essay Writer</span>
                    </div>
                    <p className="text-sm text-gray-600">Generate structured essays from your content</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-gray-900">AI Essay Grader</span>
                    </div>
                    <p className="text-sm text-gray-600">Get instant feedback and grading</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">AI Writing Tools</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Enhance your writing with AI-powered essay generation and comprehensive grading tools for better academic performance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">AI Essay Writer - Generate well-structured essays</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">AI Essay Grader - Instant feedback and scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Grammar and style suggestions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Academic writing standards compliance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 5: Library & Organization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-1 lg:order-1">
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Library className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-gray-900">Library Management</span>
                    </div>
                    <p className="text-sm text-gray-600">Organize multiple notes by topic</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Note Combination</span>
                    </div>
                    <p className="text-sm text-gray-600">Merge related documents seamlessly</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Smart Organization</span>
                    </div>
                    <p className="text-sm text-gray-600">AI-powered content categorization</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-2 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Library & Organization</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Organize your study materials like Jenni.ai with intelligent note combination and topic-based library management.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Topic-based note organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Combine multiple documents in one topic</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Smart content categorization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Easy search and retrieval</span>
                </li>
              </ul>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      {/* Interactive Demo Section */}
      <div
        id="demo-section"
        className="mx-auto mb-32 mt-32 max-w-7xl px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            See NotebookLama in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI-driven document conversations with our
            interactive demo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Interface */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  <div className="ml-auto">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        What are the main points discussed in this document?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        Based on the document, the main points include:
                      </p>
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        <li>• Financial performance analysis</li>
                        <li>• Market trend insights</li>
                        <li>• Strategic recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI is typing...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Features */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Instant Upload
                </h3>
                <p className="text-gray-600">
                  Drop your PDF and watch as NotebookLama processes it in
                  seconds, making it ready for intelligent conversations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Natural Conversations
                </h3>
                <p className="text-gray-600">
                  Ask questions in plain English and get accurate, contextual
                  answers from your documents.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600">
                  Get instant responses powered by advanced AI that understands
                  context and meaning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced File Support Section */}
      <div className="mx-auto mb-32 mt-32 max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Support for All Content Types
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any document or extract content from webpages - our AI works
            with everything
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          {/* File Types */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Supported File Types
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  type: "PDF",
                  icon: "📄",
                  desc: "Research papers, reports, books",
                },
                {
                  type: "DOC/DOCX",
                  icon: "📝",
                  desc: "Word documents, essays",
                },
                { type: "TXT", icon: "📃", desc: "Plain text files, notes" },
                { type: "MD", icon: "📋", desc: "Markdown documents" },
              ].map((file, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="text-2xl mb-2">{file.icon}</div>
                  <h4 className="font-semibold text-gray-900">{file.type}</h4>
                  <p className="text-sm text-gray-600">{file.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Webpage Extraction */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Webpage Extraction
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Extract content from any webpage using our JINA.AI integration.
              Perfect for articles, blog posts, and online resources.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Automatic content extraction
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Clean text processing
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Ready for chat instantly
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Features Showcase */}
      <div className="mx-auto mb-32 mt-32 max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Powerful Learning Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your documents into interactive learning experiences with
            our advanced AI features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quiz Feature */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI Quiz Generator
            </h3>
            <p className="text-gray-600 mb-4">
              Generate interactive quizzes from your documents to test knowledge
              and retention.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Multiple choice questions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Instant feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Performance tracking
                </span>
              </div>
            </div>
          </div>

          {/* Flashcards Feature */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Flashcards
            </h3>
            <p className="text-gray-600 mb-4">
              Create comprehensive flashcards with key concepts and definitions
              from your documents.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Auto-generated content
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Spaced repetition</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Study progress tracking
                </span>
              </div>
            </div>
          </div>

          {/* Transcript Feature */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Document Transcript
            </h3>
            <p className="text-gray-600 mb-4">
              Get detailed transcripts of your documents with highlighted key
              sections and summaries.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Structured summaries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Key point extraction
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Exportable format</span>
              </div>
            </div>
          </div>

          {/* Podcast Feature */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI Podcast
            </h3>
            <p className="text-gray-600 mb-4">
              Listen to your documents as natural-sounding podcasts with
              professional voice synthesis.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Natural voice synthesis
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Multiple voices</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Downloadable audio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Upload Interface Demo */}
        <div className="mt-16 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Enhanced Upload Experience
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our new tabbed interface makes it easy to upload files or extract
              content from webpages
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Upload Interface Mockup */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  <div className="ml-auto">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                  <div className="flex-1 bg-white rounded-md px-4 py-2 text-center text-sm font-medium text-blue-600 shadow-sm">
                    File Upload
                  </div>
                  <div className="flex-1 px-4 py-2 text-center text-sm font-medium text-gray-500">
                    Webpage
                  </div>
                </div>

                {/* File Upload Content */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Cloud className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT, MD (up to 8MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Multiple File Types
                  </h4>
                  <p className="text-gray-600">
                    Support for PDF, DOC, DOCX, TXT, and MD files. Each file
                    type is processed with specialized tools for optimal text
                    extraction.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Webpage Extraction
                  </h4>
                  <p className="text-gray-600">
                    Extract content from any webpage using JINA.AI. Perfect for
                    articles, blog posts, and online resources.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Instant Processing
                  </h4>
                  <p className="text-gray-600">
                    All content is processed and chunked automatically, making
                    it ready for AI conversations in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo of New Features */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Feature Demo Interface */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-white" />
                    <span className="text-white text-sm font-medium">
                      Learning Tools
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Quiz Demo */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      AI-Generated Quiz
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Upload your PDF and get personalized quiz questions based on
                    the actual content
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Questions are generated specifically from your document
                    </p>
                  </div>
                </div>

                {/* Flashcard Demo */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      AI-Generated Flashcards
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Personalized Learning Cards
                    </p>
                    <p className="text-sm text-gray-600">
                      Flashcards created from your document content
                    </p>
                  </div>
                </div>

                {/* Podcast Demo */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Headphones className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      Podcast Player
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">2:15 / 5:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Benefits */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Transform Learning with AI
              </h3>
              <p className="text-gray-600 mb-6">
                Our advanced AI features help you learn more effectively by
                creating interactive content from your documents.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Smart Quiz Generation
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI creates relevant questions to test your understanding
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Memory Enhancement
                  </h4>
                  <p className="text-sm text-gray-600">
                    Flashcards use spaced repetition for better retention
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Structured Learning
                  </h4>
                  <p className="text-sm text-gray-600">
                    Transcripts organize information for easy review
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Headphones className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Audio Learning
                  </h4>
                  <p className="text-sm text-gray-600">
                    Listen to documents while multitasking
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Try All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
              Start learning in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Chatting, quizzing, and learning from your documents and web
              content has never been easier than with NotebookLama.
            </p>
          </div>
        </div>

        {/* Enhanced Steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-blue-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4 transition-all duration-300 hover:border-blue-500 group">
              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Step 1
              </span>
              <span className="text-xl font-semibold group-hover:text-blue-900 transition-colors">
                Sign up for an account
              </span>
              <span className="mt-2 text-zinc-700">
                Either starting out with a free plan or choose our{" "}
                <Link
                  href="/pricing"
                  className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
                >
                  pro plan
                </Link>
                .
              </span>
              <div className="flex items-center space-x-2 mt-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  No credit card required
                </span>
              </div>
            </div>
          </li>

          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-purple-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4 transition-all duration-300 hover:border-purple-500 group">
              <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                Step 2
              </span>
              <span className="text-xl font-semibold group-hover:text-purple-900 transition-colors">
                Upload your content
              </span>
              <span className="mt-2 text-zinc-700">
                Upload PDF, DOC, DOCX, TXT, or MD files, or extract content from
                any webpage. We&apos;ll process your content and make it ready
                for you to chat with in seconds.
              </span>
              <div className="flex items-center space-x-2 mt-3">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  Secure & encrypted
                </span>
              </div>
            </div>
          </li>

          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-pink-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4 transition-all duration-300 hover:border-pink-500 group">
              <span className="text-sm font-medium text-pink-600 group-hover:text-pink-700">
                Step 3
              </span>
              <span className="text-xl font-semibold group-hover:text-pink-900 transition-colors">
                Start learning & exploring
              </span>
              <span className="mt-2 text-zinc-700">
                Chat, quiz yourself, create flashcards, get transcripts, and
                listen to podcasts. Try out NotebookLama today - it really takes
                less than a minute.
              </span>
              <div className="flex items-center space-x-2 mt-3">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  Instant responses
                </span>
              </div>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <Image
                src="/file-upload-preview.jpg"
                alt="uploading preview"
                width={1419}
                height={732}
                quality={100}
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mb-32 mt-32 max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about NotebookLama
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              question: "How does NotebookLama work?",
              answer:
                "NotebookLama uses advanced AI to analyze your PDF documents and create a searchable knowledge base. You can then ask questions in natural language, and our AI provides accurate answers based on the content of your documents.",
            },
            {
              question: "What types of documents does NotebookLama support?",
              answer:
                "NotebookLama supports multiple file types including PDF, DOC, DOCX, TXT, and MD files. You can also extract content from any webpage by simply pasting a URL. All content is processed and made ready for AI-powered conversations.",
            },
            {
              question: "Is my data secure?",
              answer:
                "Absolutely. We use enterprise-grade encryption to protect your documents and conversations. Your data is never shared with third parties, and you can delete your documents at any time.",
            },
            {
              question: "How accurate are the responses?",
              answer:
                "NotebookLama provides highly accurate responses based on the content of your documents. However, the quality depends on the clarity and structure of your original documents. We're continuously improving our AI models for better accuracy.",
            },
            {
              question: "Can I use NotebookLama for free?",
              answer:
                "Yes! NotebookLama offers a free plan that allows you to upload and chat with a limited number of documents. For unlimited usage and advanced features, you can upgrade to our Pro plan.",
            },
            {
              question: "How long does it take to process a document?",
              answer:
                "Most documents are processed within seconds. Larger or more complex documents may take up to a minute. You'll see a real-time progress indicator during processing.",
            },
            {
              question: "How does webpage extraction work?",
              answer:
                "Simply paste any URL into our webpage extraction tool, and our AI will automatically extract the main content from the page. This works great for articles, blog posts, and other web content. The extracted text is then processed just like uploaded documents.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {faq.question}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <ArrowRight className="h-4 w-4 text-blue-600 transform group-open:rotate-90 transition-transform" />
                    </div>
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mx-auto mb-32 mt-32 max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            What our users say
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of satisfied users who love NotebookLama
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Research Analyst",
              content:
                "NotebookLama has revolutionized how I work with research papers. I can quickly find relevant information across dozens of documents in seconds.",
              rating: 5,
            },
            {
              name: "Michael Chen",
              role: "Student",
              content:
                "As a graduate student, NotebookLama helps me understand complex academic papers and extract key insights for my thesis research.",
              rating: 5,
            },
            {
              name: "Emily Rodriguez",
              role: "Legal Professional",
              content:
                "The ability to quickly search through legal documents and get precise answers has made my work so much more efficient.",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mx-auto mb-32 mt-32 max-w-6xl px-6 lg:px-8">
        <PricingSection session={session} />
      </div>

      {/* FAQ Section */}
      <FAQSection faqs={homepageFAQs} />

      {/* CTA Section */}
      <div className="mx-auto mb-32 mt-32 max-w-4xl px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-16 sm:px-16 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Ready to transform your documents?
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of users who are already having intelligent
              conversations with their documents.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
