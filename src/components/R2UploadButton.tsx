"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Cloud, File, Loader2, Crown, Globe, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface R2UploadButtonProps {
  disabled?: boolean;
  topicId?: string; // Preselect and lock to a topic when provided
  topicOnly?: boolean; // Show only the Topic upload tab
  triggerLabel?: string; // Override trigger button label
  onUploadComplete?: () => void; // Callback when upload completes (useful for refreshing file lists)
}

interface Topic {
  id: string;
  name: string;
}


const R2UploadButton = ({
  disabled = false,
  topicId,
  topicOnly = false,
  triggerLabel,
  onUploadComplete,
}: R2UploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [webpageUrl, setWebpageUrl] = useState("");
  const [activeTab, setActiveTab] = useState(topicOnly ? "topic" : "file");
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topicId || "");
  const [libraryFiles, setLibraryFiles] = useState<Array<{ id: string; name: string; fileType: string | null }>>([]);
  const [libraryFilesLoading, setLibraryFilesLoading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const router = useRouter();

  const [fileKey, setFileKey] = useState<string>("");

  const { data: fileData } = trpc.getFile.useQuery(
    { key: fileKey },
    {
      enabled: !!fileKey, // Only run when we have a key
      retry: true,
      retryDelay: 1000,
      refetchInterval: 1000, // Poll every second
      refetchIntervalInBackground: true,
    }
  );

  // Navigate when file is found
  React.useEffect(() => {
    if (fileData) {
      router.push(`/dashboard/${fileData.id}`);
    }
  }, [fileData, router]);

  const startPolling = (key: string) => {
    setFileKey(key);
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || isUploading) return;

    if (files.length === 1) setSelectedFile(files[0]);

    setIsUploading(true);
    const progressInterval = startSimulatedProgress();

    try {
      // Upload sequentially to preserve progress feedback
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const formData = new FormData();
        formData.append("file", file);
        if (selectedTopicId) formData.append("topicId", selectedTopicId);

        const response = await fetch("/api/upload-r2", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();
        if (!result.success || !result.file?.key) {
          throw new Error("Upload failed");
        }

        // For the last file, trigger navigation only if NOT uploading to a topic
        // If uploading to a topic, stay on the current page (library page)
        if (i === files.length - 1 && !selectedTopicId) {
          setUploadProgress(100);
          startPolling(result.file.key);
        } else if (i === files.length - 1 && selectedTopicId) {
          // Uploading to topic - just complete progress, don't navigate
          setUploadProgress(100);
          // Call callback to refresh file lists if provided
          if (onUploadComplete) {
            setTimeout(() => {
              onUploadComplete();
            }, 500);
          }
        }
      }

      clearInterval(progressInterval);
      setTimeout(() => {
        setIsOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
      }, 1500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setIsUploading(false);
    }
  };

  const handleWebpageExtraction = async () => {
    if (!webpageUrl || isUploading) return;

    setIsUploading(true);
    const progressInterval = startSimulatedProgress();

    try {
      const response = await fetch("/api/upload-webpage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webpageUrl,
          topicId: selectedTopicId || undefined,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Webpage extraction failed");
      }

      const result = await response.json();

      if (!result.success || !result.file?.key) {
        throw new Error("Webpage extraction failed");
      }

      setUploadProgress(100);
      // Only navigate if NOT uploading to a topic
      if (!selectedTopicId) {
        startPolling(result.file.key);
      } else {
        // Call callback to refresh file lists if provided
        if (onUploadComplete) {
          setTimeout(() => {
            onUploadComplete();
          }, 500);
        }
      }

      setTimeout(() => {
        setIsOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
        setWebpageUrl("");
      }, 1500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Webpage extraction failed. Please try again."
      );
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (disabled) {
      toast.error(
        "You've reached your file upload limit. Please upgrade your plan to upload more files."
      );
      return;
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Fetch topics for current user when dialog opens
    (async () => {
      try {
        setTopicsLoading(true);
        setTopicsError(null);
        const res = await fetch("/api/library/topics");
        if (res.ok) {
          const data = await res.json();
          const list = (data.topics || []).map((t: Topic) => ({
            id: t.id,
            name: t.name,
          }));
          setTopics(list);
          // If a topicId prop was provided, ensure it's set and lock to topic tab
          if (topicId) {
            setSelectedTopicId(topicId);
            setActiveTab("topic");
          }
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = err?.error || "Failed to load topics";
          setTopicsError(msg);
          toast.error(msg);
        }
      } catch (error) {
        setTopicsError("Failed to load topics");
        toast.error("Failed to load topics");
        console.error(error)
      } finally {
        setTopicsLoading(false);
      }
    })();
  }, [isOpen, topicId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isUploading || disabled}
          onClick={handleUploadClick}
          className={disabled ? "bg-gray-400 cursor-not-allowed" : ""}
        >
          {disabled ? (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {triggerLabel || "Upload Content"}
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogTitle>Upload Content</DialogTitle>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!topicOnly ? (
            <TabsList
              className={`grid w-full ${
                topics.length > 0 ? "grid-cols-4" : "grid-cols-2"
              }`}
            >
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="webpage">Webpage</TabsTrigger>
              {topics.length > 0 && (
                <>
                  <TabsTrigger value="topic">
                    Upload to Topic
                  </TabsTrigger>
                  <TabsTrigger value="library">
                    From Library
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="topic">Upload to Selected Topic</TabsTrigger>
            </TabsList>
          )}

          {!topicOnly && (
            <TabsContent value="file" className="space-y-4">
              {topics.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-zinc-700">
                    Select Topic (optional)
                  </label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="">No topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="border h-48 border-dashed border-gray-300 rounded-lg">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                    <p className="mb-2 text-sm text-zinc-700">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">
                      PDF, DOC, DOCX, TXT, MD, Images (JPG, PNG, GIF, WebP, BMP,
                      TIFF){" "}
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-zinc-200 divide-x divide-zinc-200 mt-2">
                      <div className="px-3 py-2 grid place-items-center">
                        <File className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="px-3 py-2 text-sm truncate">
                        {selectedFile.name}
                      </div>
                    </div>
                  )}

                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </TabsContent>
          )}

          {!topicOnly && (
            <TabsContent value="webpage" className="space-y-4">
              {topics.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-zinc-700">
                    Select Topic (optional)
                  </label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="">No topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Globe className="h-6 w-6 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-700 mb-4">
                    Extract content from any webpage
                  </p>
                  <div className="w-full space-y-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/article"
                      value={webpageUrl}
                      onChange={(e) => setWebpageUrl(e.target.value)}
                      disabled={isUploading}
                      className="w-full"
                    />
                    <Button
                      onClick={handleWebpageExtraction}
                      disabled={!webpageUrl || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Extract Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {topics.length > 0 && (
            <TabsContent value="topic" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-zinc-700">
                  Upload multiple files under a selected topic.
                </p>
                {topicId ? (
                  <div className="text-sm text-zinc-700">Topic selected</div>
                ) : topics.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No topics yet. Create one in Library.
                  </p>
                ) : (
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={isUploading || topicsLoading}
                  >
                    <option value="">Select a topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
                {topicsLoading && (
                  <div className="text-xs text-zinc-500">Loading topics…</div>
                )}
                {topicsError && (
                  <div className="text-xs text-red-600">{topicsError}</div>
                )}
              </div>
              <div className="border h-48 border-dashed border-gray-300 rounded-lg">
                <label
                  htmlFor="topic-file-upload"
                  className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                    <p className="mb-2 text-sm text-zinc-700">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">
                      PDF, DOC, DOCX, TXT, MD, Images (JPG, PNG, GIF, WebP, BMP,
                      TIFF){" "}
                    </p>
                  </div>
                  <input
                    id="topic-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || !(selectedTopicId || topicId)}
                  />
                </label>
              </div>
            </TabsContent>
          )}

          {/* From Library Tab - Select existing files from topics */}
          {!topicOnly && topics.length > 0 && (
            <TabsContent value="library" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-zinc-700">
                  Select a topic to view and use files from your library.
                </p>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={selectedTopicId}
                  onChange={async (e) => {
                    const topicId = e.target.value;
                    setSelectedTopicId(topicId);
                    setSelectedFileIds(new Set()); // Clear selection when topic changes
                    if (topicId) {
                      // Fetch files from this topic
                      setLibraryFilesLoading(true);
                      try {
                        const response = await fetch(`/api/library/files?topicId=${topicId}`);
                        if (response.ok) {
                          const data = await response.json();
                          setLibraryFiles(data.files || []);
                        } else {
                          setLibraryFiles([]);
                        }
                      } catch (error) {
                        console.error("Error fetching library files:", error);
                        setLibraryFiles([]);
                      } finally {
                        setLibraryFilesLoading(false);
                      }
                    } else {
                      setLibraryFiles([]);
                    }
                  }}
                  disabled={isUploading || topicsLoading}
                >
                  <option value="">Select a topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {topicsLoading && (
                  <div className="text-xs text-zinc-500">Loading topics…</div>
                )}
                {topicsError && (
                  <div className="text-xs text-red-600">{topicsError}</div>
                )}
              </div>

              {/* Files List */}
              {selectedTopicId && (
                <div className="space-y-2">
                  {libraryFilesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                      <span className="ml-2 text-sm text-zinc-600">Loading files...</span>
                    </div>
                  ) : libraryFiles.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <File className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm text-zinc-600">
                        No files in this topic yet.
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Upload files to this topic in the Library page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Select All / Deselect All */}
                      <div className="flex items-center justify-between p-2 border-b border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFileIds.size === libraryFiles.length && libraryFiles.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFileIds(new Set(libraryFiles.map(f => f.id)));
                              } else {
                                setSelectedFileIds(new Set());
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Select All ({libraryFiles.length} files)
                          </span>
                        </label>
                        {selectedFileIds.size > 0 && selectedTopicId && (
                          <Button
                            onClick={() => {
                              // Navigate to topic view that shows all files combined
                              router.push(`/dashboard/topic/${selectedTopicId}`);
                              setIsOpen(false);
                            }}
                            className="h-8 px-3 text-xs"
                            size="sm"
                          >
                            Use {selectedFileIds.size} Selected File{selectedFileIds.size > 1 ? 's' : ''} →
                          </Button>
                        )}
                      </div>

                      {/* Files List with Checkboxes */}
                      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {libraryFiles.map((file) => (
                            <label
                              key={file.id}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 hover:border-blue-300 border border-transparent transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFileIds.has(file.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedFileIds);
                                  if (e.target.checked) {
                                    newSelected.add(file.id);
                                  } else {
                                    newSelected.delete(file.id);
                                  }
                                  setSelectedFileIds(newSelected);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <File className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {file.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {file.fileType || "Unknown type"}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Navigate to this specific file
                                  router.push(`/dashboard/${file.id}`);
                                  setIsOpen(false);
                                }}
                                className="text-blue-600 text-sm font-medium hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                              >
                                Use →
                              </button>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Use All Files Button */}
                      {libraryFiles.length > 0 && selectedTopicId && (
                        <Button
                          onClick={() => {
                            // Navigate to topic view that shows all files combined
                            router.push(`/dashboard/topic/${selectedTopicId}`);
                            setIsOpen(false);
                          }}
                          className="w-full"
                          size="lg"
                        >
                          <File className="w-4 h-4 mr-2" />
                          Use All {libraryFiles.length} Files from This Topic →
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedTopicId && (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <File className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">
                    Select a topic to view files
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {isUploading && (
          <div className="w-full mt-4">
            <Progress
              value={uploadProgress}
              indicatorColor={uploadProgress === 100 ? "bg-green-500" : ""}
              className="h-1 w-full bg-zinc-200"
            />
            {uploadProgress === 100 && (
              <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 pt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting...
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default R2UploadButton;
