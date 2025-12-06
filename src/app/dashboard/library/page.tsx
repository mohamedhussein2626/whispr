"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Library,
  Plus,
  Search,
  BookOpen,
  FileText,
  Trash2,
  FolderPlus,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BannedUserProtection from "@/components/BannedUserProtection";
import MainSidebar from "@/components/layout/MainSidebar";
import Header from "@/components/layout/Header";
import R2UploadButton from "@/components/R2UploadButton";

interface LibraryTopic {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  tags: string[];
}

interface LibraryNote {
  id: string;
  title: string;
  content: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface LibraryFile {
  id: string;
  name: string;
  fileType: string | null;
  createdAt: string;
  topicId: string | null;
}

const LibraryPage: React.FC = () => {
  const { data: session, isPending: sessionLoading } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topics, setTopics] = useState<LibraryTopic[]>([]);
  const [notes, setNotes] = useState<LibraryNote[]>([]);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [, setIsUploadingToTopic] = useState(false);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/library/topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/library/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async (topicId?: string | null) => {
    try {
      const url = topicId 
        ? `/api/library/files?topicId=${topicId}`
        : "/api/library/files";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const createTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const response = await fetch("/api/library/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTopicName,
          description: newTopicDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTopics([...topics, data.topic]);
        setNewTopicName("");
        setNewTopicDescription("");
        setIsCreateTopicOpen(false);
      }
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  const createNote = async () => {
    if (!newNoteTitle.trim() || !selectedTopic) return;

    try {
      const response = await fetch("/api/library/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
          topicId: selectedTopic,
          tags: newNoteTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([...notes, data.note]);
        setNewNoteTitle("");
        setNewNoteContent("");
        setNewNoteTags("");
        setIsCreateNoteOpen(false);
        fetchTopics(); // Refresh topic count
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (
      !confirm("Are you sure you want to delete this topic and all its notes?")
    )
      return;

    try {
      const response = await fetch(`/api/library/topics/${topicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTopics(topics.filter((topic) => topic.id !== topicId));
        setNotes(notes.filter((note) => note.topicId !== topicId));
        if (selectedTopic === topicId) {
          setSelectedTopic(null);
        }
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/library/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
        fetchTopics(); // Refresh topic count
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTopicFilesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || !selectedTopic) return;
    setIsUploadingToTopic(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("topicId", selectedTopic);
        const res = await fetch("/api/upload-r2", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }
      }
      // refresh counts after upload
      fetchTopics();
      // refresh files to show newly uploaded files
      fetchFiles(selectedTopic);
      // optionally notify user
      // toast not available here; keep silent
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingToTopic(false);
      // reset input value to allow re-upload same files if needed
      e.currentTarget.value = "";
    }
  };

  useEffect(() => {
    if (session && !sessionLoading) {
      fetchTopics();
      fetchNotes();
      fetchFiles(selectedTopic);
    }
  }, [session, sessionLoading, selectedTopic]);

  // Don't render if user is not authenticated
  if (!session) {
    return null;
  }

  const filteredNotes = selectedTopic
    ? notes.filter((note) => note.topicId === selectedTopic)
    : notes;

  const searchFilteredNotes = searchQuery
    ? filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : filteredNotes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <BannedUserProtection>
      {/* Top header */}
      <Header
        title="Library"
        subtitle="Organize and combine your notes by topic"
      />

      {/* Fixed sidebar */}
      <MainSidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      {/* Main content area with left margin to accommodate sidebar */}
      <div
        className={`min-h-screen bg-gray-50 ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={isCreateTopicOpen}
                  onOpenChange={setIsCreateTopicOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FolderPlus className="w-4 h-4" />
                      New Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Topic</DialogTitle>
                      <DialogDescription>
                        Create a new topic to organize your notes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="topic-name">Topic Name</Label>
                        <Input
                          id="topic-name"
                          value={newTopicName}
                          onChange={(e) => setNewTopicName(e.target.value)}
                          placeholder="Enter topic name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="topic-description">Description</Label>
                        <Textarea
                          id="topic-description"
                          value={newTopicDescription}
                          onChange={(e) =>
                            setNewTopicDescription(e.target.value)
                          }
                          placeholder="Enter topic description"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateTopicOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={createTopic}>Create Topic</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isCreateNoteOpen}
                  onOpenChange={setIsCreateNoteOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Note</DialogTitle>
                      <DialogDescription>
                        Add a new note to your library
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="note-title">Note Title</Label>
                        <Input
                          id="note-title"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          placeholder="Enter note title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="note-topic">Topic</Label>
                        <select
                          id="note-topic"
                          value={selectedTopic || ""}
                          onChange={(e) => setSelectedTopic(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a topic</option>
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="note-content">Content</Label>
                        <Textarea
                          id="note-content"
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Enter note content"
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="note-tags">
                          Tags (comma-separated)
                        </Label>
                        <Input
                          id="note-tags"
                          value={newNoteTags}
                          onChange={(e) => setNewNoteTags(e.target.value)}
                          placeholder="Enter tags separated by commas"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateNoteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={createNote} disabled={!selectedTopic}>
                          Create Note
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Topics Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className={`w-full text-left p-2 rounded-md transition-colors ${
                        selectedTopic === null
                          ? "bg-emerald-100 text-emerald-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      All Notes ({notes.length})
                    </button>
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors group ${
                          selectedTopic === topic.id
                            ? "bg-emerald-100 text-emerald-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <button
                          onClick={() => setSelectedTopic(topic.id)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium">{topic.name}</div>
                          <div className="text-sm text-gray-500">
                            {topic.noteCount} notes
                          </div>
                        </button>
                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Content */}
            <div className="lg:col-span-3">
              <div className="grid gap-4">
                {selectedTopic && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Upload Files to Topic
                      </CardTitle>
                      <CardDescription>
                        Attach multiple files (PDF, DOC/DOCX, TXT, MD) under
                        this topic
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">Topic:</span>
                        <span className="text-sm font-medium">
                          {topics.find((t) => t.id === selectedTopic)?.name}
                        </span>
                      </div>
                      <div className="mt-3">
                        {/* Use R2UploadButton in topic-only mode with preselected topic */}
                        <R2UploadButton
                          disabled={false}
                          topicId={selectedTopic}
                          topicOnly
                          triggerLabel="Upload files to this topic"
                          onUploadComplete={() => fetchFiles(selectedTopic)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Files Section */}
                {selectedTopic && files.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Files in this Topic
                      </CardTitle>
                      <CardDescription>
                        Click on any file to use it with all services (Quiz, Flashcards, Podcast, etc.)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files
                          .filter((file) => file.topicId === selectedTopic)
                          .map((file) => (
                            <a
                              key={file.id}
                              href={`/dashboard/${file.id}`}
                              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
                            >
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {file.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {file.fileType || "Unknown type"}
                                </p>
                              </div>
                            </a>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {searchFilteredNotes.length === 0 && (!selectedTopic || files.filter(f => f.topicId === selectedTopic).length === 0) ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Library className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery 
                          ? "No notes found" 
                          : selectedTopic 
                            ? "No notes or files yet in this topic"
                            : "No notes yet"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : selectedTopic
                            ? "Upload files or create notes to get started"
                            : "Create your first note to get started"}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsCreateNoteOpen(true)}>
                          Create Your First Note
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  searchFilteredNotes.map((note) => {
                    const topic = topics.find((t) => t.id === note.topicId);
                    return (
                      <Card
                        key={note.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {note.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                {topic && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {topic.name}
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    note.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </CardDescription>
                            </div>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {note.content}
                          </p>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BannedUserProtection>
  );
};

export default LibraryPage;
