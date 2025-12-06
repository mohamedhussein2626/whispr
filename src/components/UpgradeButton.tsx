"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface UpgradeButtonProps {
  planId?: number;
  priceId?: string | null;
}

const UpgradeButton = ({ planId }: UpgradeButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!planId) {
      toast.error("Plan not available for upgrade");
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
          planId: planId,
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

  return (
    <Button 
      onClick={handleUpgrade} 
      disabled={loading || !planId}
      className="w-full"
    >
      {loading ? "Processing..." : "Upgrade now"} 
      <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
