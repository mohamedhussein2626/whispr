"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, User, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DuplicateAccount {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface DuplicateIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateAccounts: DuplicateAccount[];
  currentIP: string;
}

export default function DuplicateIPModal({
  isOpen,
  onClose,
  duplicateAccounts,
  currentIP,
}: DuplicateIPModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-yellow-800">
              Security Warning: Duplicate IP Address Detected
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 text-base">
            We&apos;ve detected that your IP address ({currentIP}) is being used
            by other accounts. This could indicate a security concern or shared
            network usage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">
                  What does this mean?
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Multiple accounts are accessing from the same IP address
                  </li>
                  <li>
                    • This could be due to shared WiFi, office network, or VPN
                  </li>
                  <li>
                    • If you don&apos;t recognize these accounts, please contact
                    support
                  </li>
                  <li>• Consider using a unique network for better security</li>
                </ul>
              </div>
            </div>
          </div>

          {duplicateAccounts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">
                Other accounts using this IP address:
              </h4>
              <div className="space-y-2">
                {duplicateAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {account.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {account.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined{" "}
                            {format(new Date(account.createdAt), "MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="px-6">
              I Understand
            </Button>
            <Button
              onClick={() => {
                // You can add a contact support action here
                window.open(
                  "mailto:support@yourapp.com?subject=Duplicate IP Address Concern",
                  "_blank"
                );
                onClose();
              }}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
