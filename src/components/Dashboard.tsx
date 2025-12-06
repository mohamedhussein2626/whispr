"use client";

import React, { useState, useEffect, useCallback } from "react";

import {
  MessageSquare,
  Headphones,
  Brain,
  CreditCard,
  FileAudio,
  Ghost,
  Loader2,
  Plus,
  Trash,
  Crown,
  
  
  Library,
  
  PenTool,
  CheckSquare,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MainSidebar from "./layout/MainSidebar";
import Header from "./layout/Header";
import { format } from "date-fns";
import { Button } from "./ui/button";
import R2UploadButton from "./R2UploadButton";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import DuplicateIPModal from "./DuplicateIPModal";
import { checkDuplicateIP } from "@/lib/actions/checkDuplicateIP";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/app/_trpc/client";
import BillingModal from "./BillingModal";
import { toast } from "sonner";


interface UserData {
  id: string;
  name: string;
  email: string;
  planId: number | null;
  planName: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  isBanned: boolean;
  banReason: string | null;
}

interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features?: string;
  isPopular: boolean;
  wordLimitPerRequest: number;
  wordsPerMonth: number;
  numberOfFiles: number;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  status: string;
  priceId: string | null;
}


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const [showDuplicateIPModal, setShowDuplicateIPModal] = useState(false);
  const [duplicateIPData, setDuplicateIPData] = useState<{
    duplicateAccounts: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
    currentIP: string;
  } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  // Use tRPC to fetch files
  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = trpc.getUserFiles.useQuery();
  const [subLoading, setSubLoading] = useState(true);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [, setLoadingPlans] = useState(false);
  const router = useRouter();

  // Authentication check
  const { data: session, isPending: sessionLoading } = useSession();

  const isSubscribed = userData?.subscriptionStatus === "active";
  const isFreePlan = !isSubscribed;
  const hasFiles = files && files.length > 0;
  
  // Check if free plan exists and is active
  const freePlanExists = plans.some(plan => 
    plan.name.toLowerCase().includes('free') && plan.status === 'ACTIVE'
  );
  
  // File limit logic based on plan
  const getFileLimit = () => {
    if (isFreePlan) {
      // Free plan: check if there's a free plan with numberOfFiles = 0 (unlimited)
      const freePlan = plans.find(plan => plan.name.toLowerCase().includes('free') && plan.status === 'ACTIVE');
      return freePlan?.numberOfFiles || 0; // 0 means unlimited for free plan
    } else {
      // Paid plan: use the user's current plan numberOfFiles
      return userPlan?.numberOfFiles || 0;
    }
  };

  const fileLimit = getFileLimit();
  const hasReachedFileLimit = fileLimit > 0 && files && files.length >= fileLimit;
  
  // Determine if user can upload (free plan users can upload if free plan exists)
  const canUpload = !isFreePlan || (isFreePlan && freePlanExists);

  // API functions
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setSubLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.success) {
        // Only fetch active plans
        const activePlans = data.plans.filter((plan: Plan) => plan.status === 'ACTIVE');
        setPlans(activePlans);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  // Update user plan when both userData and plans are available
  useEffect(() => {
    if (userData?.planId && plans.length > 0) {
      const currentPlan = plans.find(
        (plan: Plan) => plan.id === userData.planId,
      );
      setUserPlan(currentPlan || null);
    } else if (userData && !userData.planId) {
      // If user has no planId, set userPlan to null
      setUserPlan(null);
    }
  }, [userData, plans]);

  // Use tRPC mutation for deleting files
  const deleteFileMutation = trpc.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
      refetchFiles(); // Refetch files after deletion
    },
    onError: (error) => {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    },
  });

  const deleteFile = async (fileId: string) => {
    // Check if user is banned
    if (userData?.isBanned) {
      toast.error("Your account has been suspended. You cannot perform this action.");
      return;
    }

    setCurrentlyDeletingFile(fileId);
    try {
      await deleteFileMutation.mutateAsync({ id: fileId });
    } finally {
      setCurrentlyDeletingFile(null);
    }
  };

  const handleUpgradeToPro = () => {
    // Check if user is banned
    if (userData?.isBanned) {
      toast.error("Your account has been suspended. You cannot upgrade your plan.");
      return;
    }
    setShowBillingModal(true);
  };

  const quickActions = [
    {
      id: "chat-with-pdf",
      title: "Chat with PDF",
      description: "Ask questions about your document",
      icon: MessageSquare,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "listen-to-podcast",
      title: "Listen to Podcast",
      description: "Listen to your document as audio",
      icon: Headphones,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "quiz",
      title: "Quiz",
      description: "Test your knowledge with quizzes",
      icon: Brain,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Study with AI-generated flashcards",
      icon: CreditCard,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: "transcript",
      title: "Transcript",
      description: "View document in text format",
      icon: FileAudio,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      id: "library",
      title: "Library",
      description: "Combine multiple notes in one topic",
      icon: Library,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  const aiWriterActions = [
    {
      id: "essay-writer",
      title: "AI Essay Writer",
      description: "Generate essays from your content",
      icon: PenTool,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      id: "essay-grader",
      title: "AI Essay Grader",
      description: "Get instant feedback on your essays",
      icon: CheckSquare,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  const handleQuickAction = (action: { id: string }) => {
    // Check if user is banned
    if (userData?.isBanned) {
      toast.error("Your account has been suspended. You cannot access this feature.");
      return;
    }

    // For essay writer and grader, no file requirement
    if (action.id === "essay-writer") {
      router.push("/dashboard/essay-writer");
      return;
    }
    
    if (action.id === "essay-grader") {
      router.push("/dashboard/essay-grader");
      return;
    }

    if (action.id === "library") {
      router.push("/dashboard/library");
      return;
    }

    // For other actions, require files
    if (!hasFiles) {
      alert("Please upload a PDF first to use this feature!");
      return;
    }

    // Get the most recent file
    const latestFile = files?.[0];
    if (!latestFile) {
      alert("No files available. Please upload a PDF first!");
      return;
    }

    switch (action.id) {
      case "chat-with-pdf":
        router.push(`/dashboard/${latestFile.id}?view=chatbot`);
        break;
      case "listen-to-podcast":
        router.push(`/dashboard/${latestFile.id}?view=podcast`);
        break;
      case "quiz":
        router.push(`/dashboard/${latestFile.id}/quiz`);
        break;
      case "flashcards":
        router.push(`/dashboard/${latestFile.id}/flashcards`);
        break;
      case "transcript":
        router.push(`/dashboard/${latestFile.id}/transcript`);
        break;
      default:
        console.log("Unknown action:", action.id);
    }
  };

  useEffect(() => {
    if (session && !sessionLoading) {
      fetchPlans();
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionLoading]);

  // Show plans modal when dashboard loads (only once for free plan users)
  useEffect(() => {
    if (userData) {
      // Only show modal if user has free plan or no plan
      const isFreePlan =
        !userData.planName ||
        userData.planName.toLowerCase() === "free" ||
        userData.planName.toLowerCase() === "free " ||
        userData.subscriptionStatus === "free";

      // Check if user has already seen the billing modal
      const hasSeenBillingModal = localStorage.getItem("hasSeenBillingModal");
      
      // Only show if free plan AND user hasn't seen it before AND user is not subscribed
      if (isFreePlan && !hasSeenBillingModal && userData.subscriptionStatus !== "active") {
        setShowBillingModal(true);
        // Mark as seen after showing
        localStorage.setItem("hasSeenBillingModal", "true");
      }
    }
  }, [userData]);


  // Check for duplicate IP address (only once for free users)
  useEffect(() => {
    const checkForDuplicateIP = async () => {
      if (session && !sessionLoading) {
        try {
          // Check if user has already seen the duplicate IP modal
          const hasSeenDuplicateIPModal = localStorage.getItem("hasSeenDuplicateIPModal");
          
          // Only check and show if user hasn't seen it before
          if (!hasSeenDuplicateIPModal) {
            const result = await checkDuplicateIP();
            if (result.hasDuplicate && result.duplicateAccounts) {
              setDuplicateIPData({
                duplicateAccounts: result.duplicateAccounts.map(acc => ({
                  ...acc,
                  createdAt: acc.createdAt.toISOString()
                })),
                currentIP: result.currentIP || "",
              });
              setShowDuplicateIPModal(true);
              // Mark as seen after showing
              localStorage.setItem("hasSeenDuplicateIPModal", "true");
            }
          }
        } catch (error) {
          console.error("Error checking duplicate IP:", error);
        }
      }
    };

    checkForDuplicateIP();
  }, [session, sessionLoading]);

  // Server-side auth guard will handle redirects; avoid client redirect loops

  // Don't render if session or subscription plan is still loading
  if (sessionLoading || subLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!session) {
    return null;
  }

  // Check if user is banned and show banned message
  if (userData?.isBanned) {
    return (
      <div className="flex h-screen bg-gray-50">
        <MainSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div
          className={`flex-1 overflow-auto ${
            sidebarOpen ? "ml-64" : "ml-16"
          } transition-all duration-300`}
        >
          <Header title="Account Suspended" subtitle="Your account has been suspended" />
          
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-red-900 mb-4">
                Account Suspended
              </h1>
              
              <p className="text-red-700 mb-6 text-lg">
                Your account has been suspended and you are no longer able to access our services.
              </p>
              
              {userData.banReason && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-medium text-red-900 mb-2">Reason for suspension:</h3>
                      <p className="text-red-800">{userData.banReason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">What this means:</h3>
                <ul className="text-gray-700 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    You cannot upload or access any files
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    All AI features are disabled
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Your subscription has been cancelled
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    You cannot use any paid services
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">
                  If you believe this suspension is in error, please contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <MainSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div
        className={`flex-1 overflow-auto ${
          sidebarOpen ? "ml-64" : "ml-16"
        } transition-all duration-300`}
      >
        <Header title="Dashboard" subtitle="Create new notes" />

        <div className="p-6 max-w-7xl mx-auto">
          {/* Features Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quick Actions
              </h2>
              <p className="text-gray-600">
                Choose what you&apos;d like to do with your documents
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Writer Section */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-amber-600 rounded-lg flex items-center justify-center">
                  <PenTool className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Writing Tools
                </h2>
              </div>
              <p className="text-gray-600">
                Enhance your writing with AI-powered tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiWriterActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group bg-white hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h4>
                      <p className="text-gray-600 mb-3">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          OpenAI Powered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Limit Warning */}
          {hasReachedFileLimit && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800">
                    {isFreePlan ? "You've reached your free plan limit!" : "You've reached your plan's file limit!"}
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {isFreePlan 
                      ? `You can upload up to ${fileLimit} files. Upgrade to Pro for unlimited uploads.`
                      : `Your current plan allows ${fileLimit} files. You have uploaded ${files.length} files. Upgrade to a higher plan for more files.`
                    }
                  </p>
                </div>
                <Button
                  onClick={handleUpgradeToPro}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  <Crown className="w-4 h-4" />
                  {isFreePlan ? "Start Free Trial" : "Upgrade Plan"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center my-4">
            <div className="text-sm text-gray-600">
              {fileLimit > 0 ? (
                <span>
                  Files: {files.length}/{fileLimit} 
                  {isFreePlan ? " (Free Plan)" : ` (${userPlan?.name || 'Current Plan'})`}
                </span>
              ) : (
                <span>
                  Files: {files.length} 
                  {isFreePlan ? " (Unlimited - Free Plan)" : ` (Unlimited - ${userPlan?.name || 'Current Plan'})`}
                </span>
              )}
            </div>
            {isFreePlan && !freePlanExists ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upgrade Required
                  </h3>
                  <p className="text-gray-600 mb-4 text-center">
                    You must upgrade your plan to use the upload service
                  </p>
                  <Button
                    onClick={handleUpgradeToPro}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            ) : (
              <R2UploadButton 
                disabled={hasReachedFileLimit || userData?.isBanned || !canUpload}
              />
            )}
          </div>

          {files && files.length !== 0 ? (
            <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
              {files
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((file) => (
                  <li
                    key={file.id}
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
                  >
                    <Link
                      href={userData?.isBanned ? "#" : `/dashboard/${file.id}`}
                      className="flex flex-col gap-2"
                      onClick={(e) => {
                        if (userData?.isBanned) {
                          e.preventDefault();
                          toast.error("Your account has been suspended. You cannot access files.");
                        }
                      }}
                    >
                      <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-3">
                            <h3 className="truncate text-lg font-medium text-zinc-900">
                              {file.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {format(new Date(file.createdAt), "MMM yyyy")}
                      </div>

                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        mocked
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        size="sm"
                        className="w-full"
                        variant="destructive"
                      >
                        {currentlyDeletingFile === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          ) : filesLoading ? (
            <Skeleton height={100} className="my-2" count={3} />
          ) : (
            <div className="mt-16 flex flex-col items-center gap-2">
              <Ghost className="h-8 w-8 text-zinc-800" />
              <h3 className="font-semibold text-xl">
                Pretty empty around here
              </h3>
              <p>Let&apos;s upload your first PDF.</p>
            </div>
          )}
        </div>
      </div>


      {/* Duplicate IP Warning Modal */}
      {duplicateIPData && (
        <DuplicateIPModal
          isOpen={showDuplicateIPModal}
          onClose={() => {
            setShowDuplicateIPModal(false);
            // Ensure it's marked as seen when closed
            localStorage.setItem("hasSeenDuplicateIPModal", "true");
          }}
          duplicateAccounts={duplicateIPData.duplicateAccounts}
          currentIP={duplicateIPData.currentIP}
        />
      )}

      {/* Billing Modal */}
      <BillingModal 
        isOpen={showBillingModal} 
        onClose={() => {
          setShowBillingModal(false);
          // Ensure it's marked as seen when closed
          localStorage.setItem("hasSeenBillingModal", "true");
        }} 
      />
    </div>
  );
};

export default Dashboard;
