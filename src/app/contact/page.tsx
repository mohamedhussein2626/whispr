"use client";

import { Mail, MessageCircle, Phone, MapPin, Clock, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ContactPage = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: "Email Support",
      description: "Get help with any questions or issues",
      contact: "support@notebooklama.com",
      response: "Response within 24 hours",
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-green-600" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available on our website",
      response: "Instant response during business hours",
    },
    {
      icon: <Phone className="h-6 w-6 text-purple-600" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      response: "Monday - Friday, 9 AM - 6 PM EST",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact <span className="text-blue-600">NotebookLama</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Have questions about NotebookLama? We&rsquo;re here to help! Reach out
            to us through any of the methods below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {method.icon}
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900 mb-2">
                    {method.contact}
                  </p>
                  <p className="text-sm text-gray-600">{method.response}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a Message
            </h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we&rsquo;ll get back to you as soon as
              possible.
            </p>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What is this regarding?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your question or issue..."
                  rows={5}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST
                </p>
                <p>
                  <strong>Saturday:</strong> 10:00 AM - 4:00 PM EST
                </p>
                <p>
                  <strong>Sunday:</strong> Closed
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Email support is available 24/7. We&rsquo;ll respond to all
                  emails within 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Office Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                <p className="mb-2">
                  <strong>NotebookLama HQ</strong>
                </p>
                <p>123 Innovation Drive</p>
                <p>Tech Valley, NY 12180</p>
                <p>United States</p>
                <p className="text-sm text-gray-600 mt-4">
                  Currently, we operate remotely but this is our registered
                  business address.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600 mb-6">
              Before reaching out, you might find the answer to your question in
              our FAQ section. We&rsquo;ve compiled the most common questions
              and detailed answers to help you quickly.
            </p>
            <div className="text-blue-600 font-medium">
              Check out our FAQ section for quick answers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
