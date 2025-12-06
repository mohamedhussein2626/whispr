"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  Check,
  Loader2,
  Crown,
  Sparkles,
  AlertCircle,
  PenTool,
  Copy,
  Download,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import BillingModal from "@/components/BillingModal";
import { isPremiumPlan } from "@/lib/plan-utils";

interface EssayFormData {
  topic: string;
  academicLevel: string;
  essayType: string;
  keyPoints: string;
  writingStyle: string;
  useAdvancedModel: boolean;
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

interface Plan {
  id: number;
  name: string;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  isPremium: boolean;
}

interface UsageResponse {
  success: boolean;
  usage: UsageData;
  plan: Plan;
  isFreeUser?: boolean;
  message?: string;
}

const EssayWriter = () => {
  const [formData, setFormData] = useState<EssayFormData>({
    topic: "The Impact of Climate Change on Global Economics",
    academicLevel: "Undergraduate, Graduate, High School, PhD",
    essayType: "Argumentative, Expository, Analytical, Research Paper",
    keyPoints:
      "1. Main argument\n2. Supporting evidence\n3. Counter-arguments\n4. Conclusion points",
    writingStyle:
      "Formal academic tone, APA format, 2000 words, include recent studies",
    useAdvancedModel: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState<string>("");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [, setLoading] = useState(true);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

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
          isPremium: data.plan ? isPremiumPlan(data.plan.name) : false
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
      formData.append("source", "essay_writer"); // Mark as essay writer file

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


  const handleInputChange = (
    field: keyof EssayFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (
      !formData.topic.trim() ||
      !formData.academicLevel.trim() ||
      !formData.essayType.trim() ||
      !formData.keyPoints.trim() ||
      !formData.writingStyle.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!usage) {
      toast.error("Usage data not available");
      return;
    }

    // Check if user has reached their limit
    if (
      !usage.essayWriter.unlimited &&
      usage.essayWriter.used >= usage.essayWriter.limit
    ) {
      toast.error("You have reached your essay writer limit for this month");
      return;
    }

    setIsGenerating(true);
    try {
      // Record usage first
      const usageResponse = await fetch("/api/essay-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "essay_writer",
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

      // Generate essay
      const response = await fetch("/api/generate-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Topic: ${formData.topic}\nAcademic Level: ${formData.academicLevel}\nEssay Type: ${formData.essayType}\nKey Points: ${formData.keyPoints}\nWriting Style: ${formData.writingStyle}`,
          fileId: fileId || null,
          context: fileId ? `Based on the uploaded file: ${uploadedFileName || "uploaded document"}` : "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate essay");
      }

      const result = await response.json();
      setGeneratedEssay(result.essay);
      toast.success("Essay generated successfully!");
      // Refresh usage data
      fetchUsage();
      
      // Scroll to results section after generation
      setTimeout(() => {
        const resultsSection = document.getElementById("essay-results-section");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // If no generated essay yet, scroll to file content section
          const fileContentSection = document.getElementById("file-content-section");
          if (fileContentSection) {
            fileContentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error generating essay:", error);
      toast.error("Failed to generate essay. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getMaxLength = (field: string) => {
    switch (field) {
      case "keyPoints":
        return 5000;
      default:
        return 500;
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedEssay) return;
    
    try {
      await navigator.clipboard.writeText(generatedEssay);
      toast.success("Essay copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedEssay) return;
    
    try {
      // Create a new window with the essay content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Generated Essay</title>
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
            .essay-content {
              white-space: pre-wrap;
              font-size: 12pt;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Generated Essay</h1>
          <div class="essay-content">${generatedEssay.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      toast.success("PDF download initiated!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDownloadTXT = async () => {
    if (!generatedEssay) return;
    
    try {
      const blob = new Blob([generatedEssay], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `essay-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Essay downloaded as TXT file!");
    } catch (error) {
      console.error("Failed to download TXT:", error);
      toast.error("Failed to download TXT file");
    }
  };

  const handleDownloadDOC = async () => {
    if (!generatedEssay) return;
    
    try {
      // Create HTML content for Word document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Generated Essay</title>
        </head>
        <body>
          <h1>Generated Essay</h1>
          <div style="white-space: pre-wrap; font-family: 'Times New Roman', serif; line-height: 1.6;">
            ${generatedEssay}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `essay-${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Essay downloaded as DOC file!");
    } catch (error) {
      console.error("Failed to download DOC:", error);
      toast.error("Failed to download DOC file");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI Essay Generator</h1>
        <p className="text-gray-600">
          Generate comprehensive, research-backed academic essays with proper
          citations and scholarly insights.
        </p>
      </div>

      {/* Usage Status */}
      {usage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Usage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Essay Writer: {usage.essayWriter.used} /{" "}
                  {usage.essayWriter.unlimited ? "∞" : usage.essayWriter.limit}
                </p>
                {plan && (
                  <p className="text-xs text-gray-500">Plan: {plan.name}</p>
                )}
              </div>
              {!usage.essayWriter.unlimited &&
                usage.essayWriter.used >= usage.essayWriter.limit && (
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
            Upload a document to provide context for your essay generation
          </p>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Upload a document to provide context for your essay generation
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
                  disabled={isUploading || !!(usage &&
                    !usage.essayWriter.unlimited &&
                    usage.essayWriter.used >= usage.essayWriter.limit)}
                  className="hidden"
                  id="essay-writer-upload"
                />
                <label
                  htmlFor="essay-writer-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    (isUploading || !!(usage &&
                      !usage.essayWriter.unlimited &&
                      usage.essayWriter.used >= usage.essayWriter.limit))
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Essay Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Essay Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">
                Essay topic <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  placeholder="Enter your essay topic"
                  maxLength={500}
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500">
                  {getCharacterCount(formData.topic)}/{getMaxLength("topic")}
                </div>
              </div>
            </div>

            {/* Academic Level */}
            <div className="space-y-2">
              <Label htmlFor="academicLevel" className="text-sm font-medium">
                Academic level <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="academicLevel"
                  value={formData.academicLevel}
                  onChange={(e) =>
                    handleInputChange("academicLevel", e.target.value)
                  }
                  placeholder="e.g., Undergraduate, Graduate, High School, PhD"
                  maxLength={500}
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500">
                  {getCharacterCount(formData.academicLevel)}/
                  {getMaxLength("academicLevel")}
                </div>
              </div>
            </div>

            {/* Essay Type */}
            <div className="space-y-2">
              <Label htmlFor="essayType" className="text-sm font-medium">
                Essay type <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="essayType"
                  value={formData.essayType}
                  onChange={(e) =>
                    handleInputChange("essayType", e.target.value)
                  }
                  placeholder="e.g., Argumentative, Expository, Analytical, Research Paper"
                  maxLength={500}
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500">
                  {getCharacterCount(formData.essayType)}/
                  {getMaxLength("essayType")}
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-2">
              <Label htmlFor="keyPoints" className="text-sm font-medium">
                Key points to cover <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="keyPoints"
                  value={formData.keyPoints}
                  onChange={(e) =>
                    handleInputChange("keyPoints", e.target.value)
                  }
                  placeholder="List the key points you want to cover in your essay"
                  rows={4}
                  maxLength={5000}
                  className="resize-none"
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500">
                  {getCharacterCount(formData.keyPoints)}/
                  {getMaxLength("keyPoints")}
                </div>
              </div>
            </div>

            {/* Writing Style */}
            <div className="space-y-2">
              <Label htmlFor="writingStyle" className="text-sm font-medium">
                Writing style & requirements{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="writingStyle"
                  value={formData.writingStyle}
                  onChange={(e) =>
                    handleInputChange("writingStyle", e.target.value)
                  }
                  placeholder="e.g., Formal academic tone, APA format, 2000 words"
                  maxLength={500}
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500">
                  {getCharacterCount(formData.writingStyle)}/
                  {getMaxLength("writingStyle")}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Attachments (Optional)
              </Label>
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
                      disabled={isUploading || !!(usage &&
                        !usage.essayWriter.unlimited &&
                        usage.essayWriter.used >= usage.essayWriter.limit)}
                      className="hidden"
                      id="essay-writer-attachment-upload"
                    />
                    <label
                      htmlFor="essay-writer-attachment-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        (isUploading || !!(usage &&
                          !usage.essayWriter.unlimited &&
                          usage.essayWriter.used >= usage.essayWriter.limit))
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
            </div>

            {/* Advanced AI Model */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Use advanced AI model?
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-medium">
                    Best Results
                  </span>
                  <Switch
                    checked={formData.useAdvancedModel}
                    onCheckedChange={(checked) =>
                      handleInputChange("useAdvancedModel", checked)
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Enable this feature to leverage cutting-edge AI for superior
                performance and more accurate results!
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !!(usage &&
                  !usage.essayWriter.unlimited &&
                  usage.essayWriter.used >= usage.essayWriter.limit)
              }
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>

            {/* Quality Hint */}
            <p className="text-xs text-gray-500 text-center">
              Getting low quality results? Use an advanced AI model or write a
              better description.
            </p>

            {/* Limit Warning */}
            {usage &&
              !usage.essayWriter.unlimited &&
              usage.essayWriter.used >= usage.essayWriter.limit && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      You have reached your essay writer limit for this month.
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
          </CardContent>
        </Card>

        {/* Uploaded File Content - Results Section */}
        {fileId && uploadedFileContent && (
          <Card id="file-content-section" className="mt-6 border-2 border-blue-200 shadow-lg">
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
                    <Copy className="w-4 h-4" />
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
        )}

        {/* Generated Essay - Results Section */}
        {generatedEssay && (
          <Card id="essay-results-section" className="mt-6 border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Essay
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {generatedEssay}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadTXT}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download TXT
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadDOC}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download DOC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Get access to more features by upgrading your plan.
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>10x smarter AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>More customization options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>100% commercial use rights</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Faster generation</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowBillingModal(true)}
              className="w-full gap-2"
              size="lg"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Modal */}
      <BillingModal 
        isOpen={showBillingModal} 
        onClose={() => setShowBillingModal(false)} 
      />
    </div>
  );
};

export default EssayWriter;
