"use client";

import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle } from "lucide-react";

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

interface BannedUserProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const BannedUserProtection: React.FC<BannedUserProtectionProps> = ({ 
  children, 
  fallback 
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (userData?.isBanned) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 overflow-auto">
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

  return <>{children}</>;
};

export default BannedUserProtection;
