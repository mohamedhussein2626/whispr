"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  File,
  Loader2,
  CheckCircle,
  Star,
  Clipboard,
  Download,
  AlertCircle,
  CheckSquare,
  Upload,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import BillingModal from "@/components/BillingModal";
import { isPremiumPlan } from "@/lib/plan-utils";

interface GradingResult {
  grade: string;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  overallScore: number;
}

interface UsageData {
  essayWriter: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  essayGrader: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
}
interface UsageResponse {
  success: boolean;
  usage: UsageData;
  plan: Plan;
  isFreeUser?: boolean;
  message?: string;
}

interface Plan {
  id: number;
  name: string;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  isPremium: boolean;
}

const EssayGrader = () => {
  const [activeTab, setActiveTab] = useState<"text" | "pdf">("text");
  const [essayText, setEssayText] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [, setLoading] = useState(true);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const exampleEssays = [
    "DeepPDF: AI-Powered Deep Learning for PDFs",
    "Collaborative Uses of GenAI Tools In Project-Based Learning",
    "Evaluating Solutions to Marine Plastic Pollution",
    "The Relevance of Financial Development, Natural Resources...",
  ];

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/essay-usage");
      if (response.status === 401) {
        toast.error("Please log in to use this feature");
        return;
      }
      const data: UsageResponse = await response.json();
      if (data.success) {
        console.log("📊 Usage data fetched:", data.usage);
        setUsage(data.usage);
        setPlan({
          ...data.plan,
          isPremium: data.plan ? isPremiumPlan(data.plan.name) : false,
        });
      } else {
        toast.error(data.message || "Failed to fetch usage data");
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
      toast.error("Failed to fetch usage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Fetch file content from chunks
  const fetchFileContent = async (id: string) => {
    setIsLoadingFileContent(true);
    try {
      // Fetch chunks for the file
      const response = await fetch(`/api/file-content?fileId=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setUploadedFileContent(data.content);
        } else {
          setUploadedFileContent("");
        }
      } else {
        setUploadedFileContent("");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
      setUploadedFileContent("");
    } finally {
      setIsLoadingFileContent(false);
    }
  };

  // Custom upload handler that sets fileId without navigating
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source", "essay_grader"); // Mark as essay grader file

      const response = await fetch("/api/upload-r2", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      if (result.success && result.file?.id) {
        setFileId(result.file.id);
        setUploadedFileName(result.file.name);
        setActiveTab("pdf"); // Switch to PDF tab when file is uploaded
        toast.success("File uploaded successfully!");
        
        // Fetch file content after upload
        await fetchFileContent(result.file.id);
        
        // Scroll to file content section after upload
        setTimeout(() => {
          const fileContentSection = document.getElementById("file-content-section");
          if (fileContentSection) {
            fileContentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGradeEssay = async () => {
    // Validate input based on active tab
    if (activeTab === "text" && essayText.length < 500) {
      toast.error("Please enter at least 500 characters");
      return;
    }

    if (activeTab === "pdf" && !fileId) {
      toast.error("Please upload a PDF file first");
      return;
    }

    if (!usage) {
      toast.error("Usage data not available");
      return;
    }

    // Check if user has reached their limit
    if (
      !usage.essayGrader.unlimited &&
      usage.essayGrader.used >= usage.essayGrader.limit
    ) {
      toast.error("You have reached your essay grader limit for this month");
      return;
    }

    setIsGrading(true);
    try {
      // Record usage first
      const usageResponse = await fetch("/api/essay-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "essay_grader",
          fileId: fileId,
        }),
      });

      const usageData = await usageResponse.json();
      if (!usageData.success) {
        if (usageData.limitReached) {
          toast.error(usageData.message);
          return;
        }
        throw new Error(usageData.message || "Failed to record usage");
      }

      // Grade essay
      const response = await fetch("/api/grade-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: activeTab === "text" ? essayText : "",
          criteria: "",
          fileId: activeTab === "pdf" && fileId ? fileId : null,
          context: activeTab === "pdf" && fileId ? `Based on the uploaded PDF file: ${uploadedFileName || "uploaded document"}` : "",
          inputType: activeTab,
          outputLanguage: outputLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade essay");
      }

      const result = await response.json();
      setGradingResult(result.grading);
      toast.success("Essay graded successfully!");
      // Refresh usage data
      fetchUsage();
      
      // Scroll to results section after grading
      setTimeout(() => {
        const resultsSection = document.getElementById("grading-results-section");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // If no grading result yet, scroll to file content section
          const fileContentSection = document.getElementById("file-content-section");
          if (fileContentSection) {
            fileContentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error grading essay:", error);
      toast.error("Failed to grade essay. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setEssayText(example);
  };

  const handleDownloadPDF = async () => {
    if (!gradingResult) return;
    
    try {
      // Create a new window with the grading result content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        return;
      }
      
      const content = `
        <h1>Essay Grading Report</h1>
        <div style="margin-bottom: 20px;">
          <h2>Overall Score: ${gradingResult.overallScore}/100</h2>
          <p><strong>Grade:</strong> ${gradingResult.grade}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3>Feedback</h3>
          <p>${gradingResult.feedback}</p>
        </div>
        
        ${gradingResult.strengths.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Strengths</h3>
          <ul>
            ${gradingResult.strengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${gradingResult.improvements.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Areas for Improvement</h3>
          <ul>
            ${gradingResult.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${gradingResult.suggestions.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Suggestions</h3>
          <ul>
            ${gradingResult.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      `;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Essay Grading Report</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #2c3e50;
            }
            h2, h3 {
              color: #34495e;
            }
            ul {
              margin-left: 20px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      toast.success("Grading report PDF download initiated!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadTXT = async () => {
    if (!gradingResult) return;
    
    try {
      let content = `ESSAY GRADING REPORT\n`;
      content += `========================\n\n`;
      content += `Overall Score: ${gradingResult.overallScore}/100\n`;
      content += `Grade: ${gradingResult.grade}\n\n`;
      content += `FEEDBACK:\n${gradingResult.feedback}\n\n`;
      
      if (gradingResult.strengths.length > 0) {
        content += `STRENGTHS:\n`;
        gradingResult.strengths.forEach((strength, index) => {
          content += `${index + 1}. ${strength}\n`;
        });
        content += `\n`;
      }
      
      if (gradingResult.improvements.length > 0) {
        content += `AREAS FOR IMPROVEMENT:\n`;
        gradingResult.improvements.forEach((improvement, index) => {
          content += `${index + 1}. ${improvement}\n`;
        });
        content += `\n`;
      }
      
      if (gradingResult.suggestions.length > 0) {
        content += `SUGGESTIONS:\n`;
        gradingResult.suggestions.forEach((suggestion, index) => {
          content += `${index + 1}. ${suggestion}\n`;
        });
        content += `\n`;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `essay-grading-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Grading report downloaded as TXT file!");
    } catch (error) {
      console.error("Failed to download TXT:", error);
      toast.error("Failed to download TXT file");
    }
  };

  const handleDownloadDOC = async () => {
    if (!gradingResult) return;
    
    try {
      const content = `
        <h1>Essay Grading Report</h1>
        <div style="margin-bottom: 20px;">
          <h2>Overall Score: ${gradingResult.overallScore}/100</h2>
          <p><strong>Grade:</strong> ${gradingResult.grade}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3>Feedback</h3>
          <p>${gradingResult.feedback}</p>
        </div>
        
        ${gradingResult.strengths.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Strengths</h3>
          <ul>
            ${gradingResult.strengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${gradingResult.improvements.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Areas for Improvement</h3>
          <ul>
            ${gradingResult.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${gradingResult.suggestions.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3>Suggestions</h3>
          <ul>
            ${gradingResult.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      `;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Essay Grading Report</title>
        </head>
        <body style="font-family: 'Times New Roman', serif; line-height: 1.6;">
          ${content}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `essay-grading-report-${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Grading report downloaded as DOC file!");
    } catch (error) {
      console.error("Failed to download DOC:", error);
      toast.error("Failed to download DOC file");
    }
  };

  const handleCopyFeedback = async () => {
    if (!gradingResult) return;
    
    try {
      let content = `ESSAY GRADING REPORT\n`;
      content += `Overall Score: ${gradingResult.overallScore}/100 (${gradingResult.grade})\n\n`;
      content += `FEEDBACK:\n${gradingResult.feedback}\n\n`;
      
      if (gradingResult.strengths.length > 0) {
        content += `STRENGTHS:\n`;
        gradingResult.strengths.forEach((strength, index) => {
          content += `${index + 1}. ${strength}\n`;
        });
        content += `\n`;
      }
      
      if (gradingResult.improvements.length > 0) {
        content += `AREAS FOR IMPROVEMENT:\n`;
        gradingResult.improvements.forEach((improvement, index) => {
          content += `${index + 1}. ${improvement}\n`;
        });
        content += `\n`;
      }
      
      if (gradingResult.suggestions.length > 0) {
        content += `SUGGESTIONS:\n`;
        gradingResult.suggestions.forEach((suggestion, index) => {
          content += `${index + 1}. ${suggestion}\n`;
        });
      }
      
      await navigator.clipboard.writeText(content);
      toast.success("Grading feedback copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Section - White Background */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              AI Essay Grader - Grade My College Essays Online Free
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI Grader is the ultimate tool for grading essays, and
              assignments. Whether you&apos;re a teacher or student, this AI
              grader for essays provides accurate feedback in under 3 seconds.
              Free, online, and with no sign-up required, try our AI Grader
              today for quick, reliable results.
            </p>
          </div>

          {/* Usage Status */}
          {usage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Usage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Essay Grader: {usage.essayGrader.used} /{" "}
                      {usage.essayGrader.unlimited
                        ? "∞"
                        : usage.essayGrader.limit}
                    </p>
                    {plan && (
                      <p className="text-xs text-gray-500">Plan: {plan.name}</p>
                    )}
                  </div>
                  {!usage.essayGrader.unlimited &&
                    usage.essayGrader.used >= usage.essayGrader.limit && (
                      <Button
                        onClick={() => setShowBillingModal(true)}
                        className="gap-2"
                        variant="default"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade Plan
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document (Optional)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload a document to provide context for your essay grading
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Upload images and PDFs to enhance your AI-generated content
                </p>
                {fileId ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-green-800">File Uploaded</p>
                        <p className="text-xs text-green-600 truncate">{uploadedFileName || "File uploaded"}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFileId(null);
                        setUploadedFileName(null);
                        setUploadedFileContent("");
                        if (activeTab === "pdf") {
                          setActiveTab("text");
                        }
                      }}
                      className="w-full"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      disabled={isUploading || !!(
                        usage &&
                        !usage.essayGrader.unlimited &&
                        usage.essayGrader.used >= usage.essayGrader.limit
                      )}
                      className="hidden"
                      id="essay-grader-upload"
                    />
                    <label
                      htmlFor="essay-grader-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        (isUploading || !!(
                          usage &&
                          !usage.essayGrader.unlimited &&
                          usage.essayGrader.used >= usage.essayGrader.limit
                        ))
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload File
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Input Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                    activeTab === "text"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("pdf")}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                    activeTab === "pdf"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4" />
                    PDF
                  </div>
                </button>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                {activeTab === "text" ? (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Textarea
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        placeholder="Enter your essay paragraphs, at least 500 characters."
                        className="min-h-[200px] resize-none"
                        maxLength={2000}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                          {essayText.length}/2000 characters
                        </span>
                        <span className="text-sm text-gray-500">
                          Minimum 500 characters required
                        </span>
                      </div>
                    </div>

                    <div className="w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output Language
                      </label>
                      <select
                        value={outputLanguage}
                        onChange={(e) => setOutputLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {fileId ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="flex-1 text-left">
                              <h3 className="text-lg font-medium text-green-800 mb-1">
                                File Uploaded Successfully
                              </h3>
                              <p className="text-sm text-green-600 truncate">
                                {uploadedFileName || "File uploaded"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFileId(null);
                              setUploadedFileName(null);
                              setUploadedFileContent("");
                            }}
                            className="w-full"
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Upload PDF Essay
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Upload a PDF file containing your essay for AI grading
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.md"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file);
                              }
                            }}
                            disabled={isUploading || !!(
                              usage &&
                              !usage.essayGrader.unlimited &&
                              usage.essayGrader.used >= usage.essayGrader.limit
                            )}
                            className="hidden"
                            id="essay-grader-pdf-upload"
                          />
                          <label
                            htmlFor="essay-grader-pdf-upload"
                            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                              (isUploading || !!(
                                usage &&
                                !usage.essayGrader.unlimited &&
                                usage.essayGrader.used >= usage.essayGrader.limit
                              ))
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload File
                              </>
                            )}
                          </label>
                        </>
                      )}
                    </div>

                    <div className="w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output Language
                      </label>
                      <select
                        value={outputLanguage}
                        onChange={(e) => setOutputLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGradeEssay}
                  disabled={
                    isGrading ||
                    !!(
                      usage &&
                      !usage.essayGrader.unlimited &&
                      usage.essayGrader.used >= usage.essayGrader.limit
                    ) ||
                    (activeTab === "text" && essayText.length < 500) ||
                    (activeTab === "pdf" && !fileId)
                  }
                  className="w-full py-4 text-lg font-semibold"
                  size="lg"
                >
                  {isGrading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Grading...
                    </>
                  ) : (
                    `Grade ${activeTab === "text" ? "Text" : "PDF"} Essay`
                  )}
                </Button>

                {/* Limit Warning */}
                {usage &&
                  !usage.essayGrader.unlimited &&
                  usage.essayGrader.used >= usage.essayGrader.limit && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>
                          You have reached your essay grader limit for this month.
                          Please upgrade your plan to continue.
                        </span>
                        <Button
                          onClick={() => setShowBillingModal(true)}
                          className="ml-4 gap-2"
                          variant="default"
                          size="sm"
                        >
                          <Crown className="w-4 h-4" />
                          Upgrade Plan
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Example Essays */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Example Essays
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {exampleEssays.map((example, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleExampleClick(example)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-2">
                          {example}
                        </p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          [Example]
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Light Blue Background */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                AI Grader for Effortless Grading
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Without AI Grader, grading assignments can be time-consuming and
                prone to errors. The AI Grader streamlines the grading process,
                offering accurate, quick feedback for essays, assignment, and
                tests. Whether you&apos;re a teacher or a student, an AI Grader
                for essays and assignment helps reduce workload and ensures fair
                grading every time.
              </p>
            </div>

            {/* Right Content - Advertisement Style */}
            <div className="bg-green-50 rounded-xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NG</span>
                  </div>
                  <span className="text-green-800 font-semibold">NoteGPT</span>
                </div>

                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  AI Grader
                </h3>

                <p className="text-green-700 mb-4">
                  AI Grader instantly grades your essay and papers in 3 seconds.
                  Get precise corrections and suggestions with our advanced text
                  AI grader for fast feedback and AI grader for teachers.
                </p>

                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>https://notegpt.io/</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
              <div className="absolute bottom-4 right-8 w-12 h-12 bg-green-300 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded File Content - Results Section */}
      {fileId && uploadedFileContent && (
        <div id="file-content-section" className="bg-white py-8 mt-8">
          <div className="max-w-4xl mx-auto px-6">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Uploaded File Content
                </CardTitle>
                <p className="text-sm text-blue-600 mt-1">{uploadedFileName || "Uploaded file"}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {isLoadingFileContent ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading file content...</span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {uploadedFileContent}
                      </pre>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        if (uploadedFileContent) {
                          await navigator.clipboard.writeText(uploadedFileContent);
                          toast.success("File content copied to clipboard!");
                        }
                      }}
                      className="gap-2"
                      disabled={!uploadedFileContent || isLoadingFileContent}
                    >
                      <Clipboard className="w-4 h-4" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (uploadedFileContent) {
                          const blob = new Blob([uploadedFileContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${uploadedFileName || 'file'}-content.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                          toast.success("File content downloaded!");
                        }
                      }}
                      className="gap-2"
                      disabled={!uploadedFileContent || isLoadingFileContent}
                    >
                      <Download className="w-4 h-4" />
                      Download TXT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Grading Results - Results Section */}
      {gradingResult && (
        <div id="grading-results-section" className="bg-white py-8 mt-8">
          <div className="max-w-4xl mx-auto px-6">
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Grading Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Overall Score</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {gradingResult.overallScore}/100
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Grade: {gradingResult.grade}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Feedback</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {gradingResult.feedback}
                  </p>
                </div>

                {/* Strengths */}
                {gradingResult.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {gradingResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {gradingResult.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-800 mb-2">
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {gradingResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {gradingResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Suggestions
                    </h4>
                    <ul className="space-y-1">
                      {gradingResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Clipboard className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleDownloadTXT}
                  >
                    <Download className="w-4 h-4" />
                    Download TXT
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleDownloadDOC}
                  >
                    <Download className="w-4 h-4" />
                    Download DOC
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleCopyFeedback}
                  >
                    <Clipboard className="w-4 h-4" />
                    Copy Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      <BillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
      />
    </div>
  );
};

export default EssayGrader;
