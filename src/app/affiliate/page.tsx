


"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  BarChart3,
  Share2,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import FAQSection, { affiliateFAQs } from "@/components/FAQSection";

interface AffiliateData {
  isAffiliate: boolean;
  affiliate?: {
    id: string;
    referralCode: string;
    name: string;
    email: string;
    joinedAt: string;
  };
  stats?: {
    totalCommissions: number;
    totalReferrals: number;
    totalCommissionsCount: number;
  };
}

interface Commission {
  referredUser: {
    name: string;
  };
  subscription?: {
    plan: {
      name: string;
      interval: string;
    };
  };
  amount: number;
  status: "PAID" | "PENDING" | "FAILED";
}

interface Referral {
  name: string;
  email: string;
  createdAt: string;
  subscriptionStatus: "active" | "inactive";
  planName: string;
}

interface DashboardData {
  stats: {
    totalCommissions: number;
    totalCommissionsCount: number;
    pendingCommissions: number;
    pendingCommissionsCount: number;
    paidCommissions: number;
    paidCommissionsCount: number;
    totalReferrals: number;
    conversionRate: number;
  };
  recentCommissions: Commission[];
  recentReferrals: Referral[];
  referralCode: string;
  referralLink: string;
  refgrow: {
    connected: boolean;
    stats?: Record<string, unknown>;
  };
}

const AffiliateProgram = () => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(
    null,
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

useEffect(() => {
  fetchAffiliateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch("/api/affiliate/register");

      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }

      const data: AffiliateData = await response.json();
      setAffiliateData(data);

      if (data.isAffiliate) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
      window.location.href = "/auth";
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/affiliate/dashboard");
      const data: DashboardData & { success?: boolean } = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const response = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.status === 401) {
        toast.error("Please log in to join the affiliate program");
        window.location.href = "/auth";
        return;
      }

      const data: AffiliateData & { success?: boolean; error?: string } =
        await response.json();

      if (data.success) {
        setAffiliateData(data);
        toast.success("Successfully registered as an affiliate!");
        fetchDashboardData();
      } else {
        toast.error(data.error || "Failed to register as affiliate");
      }
    } catch (error) {
      toast.error("Failed to register as affiliate");
      console.error("Error registering as affiliate:", error);
    } finally {
      setRegistering(false);
    }
  };

  const copyReferralLink = () => {
    if (dashboardData?.referralLink) {
      navigator.clipboard.writeText(dashboardData.referralLink);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const copyReferralCode = () => {
    if (dashboardData?.referralCode) {
      navigator.clipboard.writeText(dashboardData.referralCode);
      toast.success("Referral code copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading affiliate program...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Affiliate Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Earn 30% commission on every subscription you refer. Join our
            affiliate program and start earning today!
          </p>
        </div>

        {!affiliateData?.isAffiliate ? (
          /* Registration Form */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-green-600" />
                  Join Our Affiliate Program
                </CardTitle>
                <CardDescription>
                  Start earning commissions by referring users to our AI
                  humanization service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-blue-900">
                        30% Commission
                      </h3>
                      <p className="text-sm text-blue-700">
                        On every subscription
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-green-900">
                        Unlimited Referrals
                      </h3>
                      <p className="text-sm text-green-700">
                        No limit on earnings
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-purple-900">
                        Real-time Tracking
                      </h3>
                      <p className="text-sm text-purple-700">
                        Monitor your performance
                      </p>
                    </div>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="text-center">
                      <Button
                        type="submit"
                        disabled={registering}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                      >
                        {registering
                          ? "Registering..."
                          : "Join Affiliate Program"}
                      </Button>
                    </div>
                  </form>

                  {/* Terms */}
                  <div className="text-sm text-gray-600 text-center">
                    <p>
                      By joining, you agree to our affiliate terms and
                      conditions.
                    </p>
                    <p>
                      Commissions are paid monthly via PayPal or bank transfer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Affiliate Dashboard */
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        $
                        {dashboardData?.stats.totalCommissions.toFixed(2) ||
                          "0.00"}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Referrals
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.stats.totalReferrals || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        $
                        {dashboardData?.stats.pendingCommissions.toFixed(2) ||
                          "0.00"}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Conversion Rate
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboardData?.stats.conversionRate.toFixed(1) ||
                          "0.0"}
                        %
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Refgrow Status
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.refgrow.connected
                          ? "Connected"
                          : "Not Connected"}
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        dashboardData?.refgrow.connected
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {dashboardData?.refgrow.connected ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-blue-600" />
                  Your Referral Tools
                </CardTitle>
                <CardDescription>
                  Share these links and codes to start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referral-link">Referral Link</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="referral-link"
                        value={dashboardData?.referralLink || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button onClick={copyReferralLink} size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="referral-code">Referral Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="referral-code"
                        value={dashboardData?.referralCode || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button onClick={copyReferralCode} size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for detailed data */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Commissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.recentCommissions.length ? (
                        <div className="space-y-3">
                          {dashboardData.recentCommissions
                            .slice(0, 5)
                            .map((commission, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">
                                    {commission.referredUser.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {commission.subscription?.plan.name} -{" "}
                                    {commission.subscription?.plan.interval}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    ${commission.amount.toFixed(2)}
                                  </p>
                                  <Badge
                                    variant={
                                      commission.status === "PAID"
                                        ? "default"
                                        : commission.status === "PENDING"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {commission.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No commissions yet
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.recentReferrals.length ? (
                        <div className="space-y-3">
                          {dashboardData.recentReferrals
                            .slice(0, 5)
                            .map((referral, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{referral.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {referral.email}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {new Date(
                                      referral.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                  <Badge
                                    variant={
                                      referral.subscriptionStatus === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {referral.planName}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No referrals yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="commissions">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission History</CardTitle>
                    <CardDescription>
                      Track all your commission earnings and payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Commission history will be displayed here
                      </p>
                      <p className="text-sm text-gray-400">
                        This feature will show detailed commission tracking
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referrals">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Management</CardTitle>
                    <CardDescription>
                      Manage and track your referrals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Referral management tools will be displayed here
                      </p>
                      <p className="text-sm text-gray-400">
                        This feature will show detailed referral tracking
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* FAQ Section */}
        <FAQSection 
          faqs={affiliateFAQs} 
          title="Affiliate Program FAQs"
          description="Common questions about our affiliate program and commission structure"
        />
      </div>
    </div>
  );
};

export default AffiliateProgram;