"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Crown, Check, Star, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export interface Plan {
  id: number;
  name: string;
  description?: string;
  features?: string;
  price: number;
  priceId?: string;
  interval: string;
  status: string;
  isPopular: boolean;
  numberOfFiles: number;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  planId?: number;
  planName: string;
  subscriptionId?: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionPlan?: Plan | null; 
}

const BillingModal = ({
  isOpen,
  onClose,
}: BillingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch plans and user profile data
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      const [plansResponse, profileResponse] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/user/profile")
      ]);

      const plansData = await plansResponse.json();
      const profileData = await profileResponse.json();

      if (plansData.success) {
        setPlans(plansData.plans);
        // Set the first paid plan as default selection
        const paidPlans = plansData.plans.filter((plan: Plan) => plan.price > 0);
        if (paidPlans.length > 0) {
          setSelectedPlan(paidPlans[0]);
        }
      }

      if (profileData.success) {
        setUserProfile(profileData.user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load plans and profile data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = userProfile?.subscriptionStatus === "active";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Select the perfect plan for your needs and unlock powerful features
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading plans...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Status */}
            {userProfile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Plan</CardTitle>
                  <CardDescription>
                    You are currently on the{" "}
                    <strong>{userProfile.planName || "Free"}</strong> plan.
                    {isSubscribed && (
                      <span className="ml-2">
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Available Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.filter(plan => plan.price > 0).map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id 
                      ? "ring-2 ring-blue-500 border-blue-500" 
                      : "hover:border-gray-300"
                  } ${plan.isPopular ? "border-yellow-300 bg-yellow-50" : ""}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {plan.isPopular && <Star className="w-4 h-4 text-yellow-500" />}
                        {plan.name}
                      </CardTitle>
                      {plan.isPopular && (
                        <Badge className="bg-yellow-500 text-white">Popular</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {plan.description || "Perfect for getting started"}
                    </CardDescription>
                  </CardHeader>
                  
                  <div className="px-6 pb-4">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.interval}
                      </span>
                    </div>
                    
                    {/* Plan Features */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {plan.numberOfFiles === 0 ? "Unlimited" : plan.numberOfFiles} file uploads
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {plan.numberOfEssayWriter === 0 ? "Unlimited" : plan.numberOfEssayWriter} AI Essay Writer uses
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          {plan.numberOfEssayGrader === 0 ? "Unlimited" : plan.numberOfEssayGrader} AI Essay Grader uses
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Advanced AI features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Plan Summary */}
            {selectedPlan && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Selected Plan: {selectedPlan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    ${selectedPlan.price}
                    <span className="text-sm font-normal text-blue-700">
                      /{selectedPlan.interval}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleUpgrade}
            disabled={loading || fetchingData || !selectedPlan}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubscribed
              ? "Upgrade Plan"
              : "Subscribe Now"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillingModal;