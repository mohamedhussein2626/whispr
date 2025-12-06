"use client";

import React from "react";
import { FileText, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

interface FileData {
  id: string;
  name: string;
  uploadDate: string;
}

interface FileGridProps {
  files: FileData[];
}

const FileGrid: React.FC<FileGridProps> = ({ files }) => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">All Notes</h2>
        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Folder</span>
        </button>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-4">
        {files.map((file) => (
          <Link
            key={file.id}
            href={`/dashboard/${file.id}`}
            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group border border-transparent hover:border-gray-200"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
              <p className="text-sm text-gray-600">
                Created on {file.uploadDate}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle options
              }}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-lg transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default FileGrid;
