"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Crown,
  MessageSquare,
  Headphones,
  Brain,
  CreditCard,
  FileAudio,
  Settings,
  LogOut,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  PenTool,
  BookOpen,
} from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainSidebar from "@/components/layout/MainSidebar";
import Header from "@/components/layout/Header";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import BannedUserProtection from "@/components/BannedUserProtection";

interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features?: string;
  isPopular: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  planId?: number;
  planName?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: user, isLoading } = trpc.me.useQuery();
  const [isLoggingOut,] = useState(false);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userRes = await fetch("/api/user/profile");
      const userData = await userRes.json();

      if (userData.success) {
        setUserData(userData.user);
        console.log("Settings: User data:", userData.user);

        // Fetch plans to get plan details
        const plansRes = await fetch("/api/admin/plans");
        const plansData = await plansRes.json();
        console.log("Settings: Plans data:", plansData);

        if (plansData.success) {
          // Try to find plan by planId first, then by planName
          let currentPlan = null;
          if (userData.user.planId) {
            currentPlan = plansData.plans.find(
              (plan: Plan) => plan.id === userData.user.planId
            );
            console.log("Settings: Found plan by ID:", currentPlan);
          }
          // If no plan found by ID, try to find by name
          if (!currentPlan && userData.user.planName) {
            currentPlan = plansData.plans.find((plan: Plan) =>
              plan.name
                .toLowerCase()
                .includes(userData.user.planName.toLowerCase())
            );
            console.log("Settings: Found plan by name:", currentPlan);
          }
          setUserPlan(currentPlan || null);
          console.log("Settings: Final user plan:", currentPlan);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSignout = async () => {
    await signOut();
    router.push("/auth");
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "free":
        return "bg-gray-100 text-gray-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "free":
        return <AlertCircle className="w-4 h-4" />;
      case "canceled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const features = [
    {
      id: "chat-with-pdf",
      title: "Chat with PDF",
      description:
        "Ask questions about your document and get instant AI-powered responses",
      icon: MessageSquare,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      status: "Active",
    },
    {
      id: "listen-to-podcast",
      title: "Listen to Podcast",
      description:
        "Convert your documents into engaging audio podcasts with natural voice",
      icon: Headphones,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      status: "Active",
    },
    {
      id: "quiz",
      title: "Quiz",
      description:
        "Test your knowledge with AI-generated quizzes based on your documents",
      icon: Brain,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      status: "Active",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description:
        "Study efficiently with AI-generated flashcards from your content",
      icon: CreditCard,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      status: "Active",
    },
    {
      id: "transcript",
      title: "Transcript",
      description: "Get clean, formatted transcripts of your documents",
      icon: FileAudio,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      status: "Active",
    },
    {
      id: "easy-write",
      title: "Easy Write",
      description:
        "AI-powered writing assistant to help you create and improve your content",
      icon: PenTool,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      status: "Active",
    },
    {
      id: "easy-grader",
      title: "Easy Grader",
      description:
        "Automatically grade and provide feedback on written assignments and essays",
      icon: BookOpen,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      status: "Active",
    },
  ];

  if (isLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading your settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BannedUserProtection>
      <div className="flex h-screen bg-gray-50">
        <MainSidebar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`flex-1 overflow-auto ${
            sidebarOpen ? "ml-64" : "ml-16"
          } transition-all duration-300`}
        >
          <Header
            title="Settings"
            subtitle="Manage your account and preferences"
          />

          <div className="p-6 max-w-7xl mx-auto">
            {/* User Profile Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your personal information and subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        user?.stripeSubscriptionId ? "default" : "secondary"
                      }
                    >
                      {user?.stripeSubscriptionId ? (
                        <Crown className="w-3 h-3 mr-1" />
                      ) : null}
                      {user?.stripeSubscriptionId ? "Pro Plan" : "Free Plan"}
                    </Badge>
                    {user?.stripeSubscriptionId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Renews{" "}
                        {user?.stripeCurrentPeriodEnd
                          ? new Date(
                              user.stripeCurrentPeriodEnd
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your personal account details and membership information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.name || user?.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {userData?.email || user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Member Since
                    </label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {userData?.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Status
                    </label>
                    <div className="flex items-center">
                      <Badge
                        className={`${getStatusColor(
                          userData?.subscriptionStatus ||
                            (user?.stripeSubscriptionId ? "active" : "free")
                        )} flex items-center`}
                      >
                        {getStatusIcon(
                          userData?.subscriptionStatus ||
                            (user?.stripeSubscriptionId ? "active" : "free")
                        )}
                        <span className="ml-1 capitalize">
                          {userData?.subscriptionStatus ||
                            (user?.stripeSubscriptionId ? "active" : "free")}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Details
                </CardTitle>
                <CardDescription>
                  Your current subscription plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Plan
                    </label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                      {userData?.planName ||
                        userPlan?.name ||
                        (user?.stripeSubscriptionId ? "Pro Plan" : "Free Plan")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Price
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {userPlan
                        ? `$${userPlan.price} / ${userPlan.interval}`
                        : userData?.planName === "Pro" ||
                          user?.stripeSubscriptionId
                        ? "Premium Plan"
                        : "Free"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Subscription ID
                    </label>
                    <p className="text-sm font-mono text-gray-600">
                      {userData?.subscriptionId || "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Plan Features
                    </label>
                    <div className="text-sm text-gray-600">
                      {userPlan?.description ||
                        (user?.stripeSubscriptionId
                          ? "Premium features included"
                          : "Basic features")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Available Features
                </CardTitle>
                <CardDescription>
                  All the powerful features available in NotebookLama
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                          <feature.icon
                            className={`w-5 h-5 ${feature.iconColor}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">
                              {feature.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logout Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Sign Out</h4>
                      <p className="text-sm text-red-700">
                        Sign out of your account
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleSignout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BannedUserProtection>
  );
}
