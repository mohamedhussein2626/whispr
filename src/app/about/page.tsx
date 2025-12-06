import {
  MessageCircle,
  Zap,
  Shield,
  Upload,
  Bot,
  Search,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AboutPage = () => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-600" />,
      title: "Easy Upload",
      description:
        "Simply drag and drop your PDF files. We support all standard PDF formats.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-green-600" />,
      title: "Natural Conversations",
      description:
        "Chat with your documents using natural language. Ask questions as if you're talking to a friend.",
    },
    {
      icon: <Bot className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered Insights",
      description:
        "Our advanced AI understands context and provides accurate, relevant answers from your documents.",
    },
    {
      icon: <Search className="h-8 w-8 text-orange-600" />,
      title: "Instant Search",
      description:
        "Find specific information across your documents in seconds, not minutes.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description:
        "Your documents are encrypted and secure. We prioritize your privacy and data protection.",
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: "Save Time",
      description:
        "No more scrolling through pages. Get the information you need instantly with smart queries.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">NotebookLama</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            NotebookLama revolutionizes how you interact with documents. Upload
            any PDF and start having meaningful conversations with your content
            using cutting-edge AI technology.
          </p>
        </div>

        {/* What It Does */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What is NotebookLama?
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              NotebookLama is an intelligent document assistant that allows you to
              have natural conversations with your PDF files. Instead of
              manually searching through pages of content, simply ask questions
              and get instant, accurate answers.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you&apos;re a student researching academic papers, a
              professional analyzing reports, or anyone who works with documents
              regularly, NotebookLama transforms static PDFs into interactive,
              intelligent resources that respond to your queries in real-time.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload</h3>
              <p className="text-gray-600">
                Upload your PDF document to our secure platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Chat</h3>
              <p className="text-gray-600">
                Ask questions in natural language about your document
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Get Answers</h3>
              <p className="text-gray-600">
                Receive instant, accurate responses with source references
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Students & Researchers
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Quickly find information in research papers</li>
                <li>• Get explanations of complex concepts</li>
                <li>• Generate study summaries</li>
                <li>• Analyze academic literature efficiently</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Business Professionals
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Review contracts and legal documents</li>
                <li>• Extract insights from business reports</li>
                <li>• Analyze financial statements</li>
                <li>• Streamline document workflows</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
