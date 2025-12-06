"use client";

import { AlertTriangle, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannedUserMessageProps {
  banReason?: string;
}

export default function BannedUserMessage({ banReason }: BannedUserMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Suspended
          </h1>
          <p className="text-gray-600 mb-4">
            Your account has been temporarily suspended and you cannot access file upload services.
          </p>
        </div>

        {banReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Reason for suspension:
                </h3>
                <p className="text-sm text-red-700">
                  {banReason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Need help?
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  If you believe this is an error or would like to appeal this decision, please contact our support team.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => window.open('mailto:support@notebooklama.com?subject=Account Suspension Appeal', '_blank')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>
              This suspension is temporary. Please review our terms of service and community guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
