"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";
import { Plan } from "@/app/lib/types/plan";

type SessionData = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
  };
};


interface PriceSectionClientProps {
  session: SessionData | null;
}

export default function PriceSectionClient({
  session,
}: PriceSectionClientProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "lifetime">(
    "monthly",
  );

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await res.json();
      setPlans(data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  };

  const subscribeToPlan = async (planId: number) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout session URL missing");
      }
    } catch (err) {
      console.error("Error subscribing to plan:", err);
      toast.error("Failed to redirect to checkout");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Get available billing cycles from existing plans
  const availableBillingCycles = Array.from(
    new Set(plans.filter(plan => plan.status === "ACTIVE").map(plan => plan.interval))
  ) as ("monthly" | "yearly" | "lifetime")[];

  // Set default billing cycle to first available one
  React.useEffect(() => {
    if (availableBillingCycles.length > 0 && !availableBillingCycles.includes(billingCycle)) {
      setBillingCycle(availableBillingCycles[0]);
    }
  }, [availableBillingCycles, billingCycle]);

  // Add "lifetime" to the filteredPlans
  const filteredPlans = plans.filter(
    (plan: Plan) => plan.status === "ACTIVE" && plan.interval === billingCycle,
  );

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Get more powerful AI capabilities with our affordable plans
      </h2>

      {/* Billing Cycle Tabs - Only show available cycles */}
      {availableBillingCycles.length > 1 && (
        <div className="flex justify-center items-center mb-12 space-x-4">
          {availableBillingCycles.map((cycle) => (
            <button
              key={cycle}
              className={clsx(
                "px-6 py-2 rounded-full text-sm font-medium transition",
                billingCycle === cycle
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
              onClick={() => setBillingCycle(cycle)}
            >
              {cycle === "monthly" && "Monthly"}
              {cycle === "yearly" && (
                <>
                  Yearly <span className="ml-1 text-green-500">Save up to 60%</span>
                </>
              )}
              {cycle === "lifetime" && "Lifetime"}
            </button>
          ))}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.length === 0 ? (
          <p className="text-center col-span-3 text-muted-foreground">
            No active plans available.
          </p>
        ) : (
          filteredPlans.map((plan: Plan) => (
            <div
              key={plan.id}
              className={clsx(
                "flex flex-col justify-between rounded-2xl border shadow-lg p-6 relative",
                plan.isPopular
                  ? "bg-purple-800 text-white"
                  : "bg-white text-gray-900",
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p
                  className={clsx(
                    "mb-6",
                    plan.isPopular ? "text-purple-200" : "text-gray-500",
                  )}
                >
                  {plan.description || "Perfect plan for your needs"}
                </p>

                {/* Price */}
                <div className="text-4xl font-bold mb-1">
                  ${plan.price}
                  <span
                    className={clsx(
                      "text-sm font-medium ml-2",
                      plan.isPopular ? "text-purple-200" : "text-gray-500",
                    )}
                  >
                    /{billingCycle}
                  </span>
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {(plan.features?.split(/[\n,]+/) || []).map((feature: string) => (
                    <li
                      key={feature.trim()}
                      className="flex items-start space-x-2 text-sm"
                    >
                      <Check
                        className={clsx(
                          "w-4 h-4 mt-1 flex-shrink-0",
                          plan.isPopular ? "text-green-300" : "text-green-500",
                        )}
                      />
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={clsx(
                  "w-full mt-8",
                  plan.isPopular
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white",
                )}
                onClick={async () => {
                  // Check if user is authenticated
                  if (!session) {
                    console.log("No session found, redirecting to auth");
                    router.push("/auth");
                    return;
                  }

                  // Check if user has valid session data
                  if (
                    !session.user ||
                    !session.user.id ||
                    !session.user.email
                  ) {
                    console.log("Invalid session data, redirecting to auth");
                    router.push("/auth");
                    return;
                  }

                  try {
                    console.log(
                      `User ${session.user.email} subscribing to plan ${plan.id}`,
                    );
                    await subscribeToPlan(plan.id);
                  } catch (error) {
                    console.error("Error during subscription:", error);
                    // Show error message to user
                    alert("Failed to start checkout. Please try again.");
                  }
                }}
              >
                Start Free Trial
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}