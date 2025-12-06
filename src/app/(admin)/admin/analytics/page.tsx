"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  FileText,
  Brain,
  TrendingUp,
  Activity,
  Download,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Analytics {
  users: {
    total: number;
    active: number;
    free: number;
    banned: number;
    recentRegistrations: number;
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    planDistribution: Array<{
      planName: string;
      count: number;
    }>;
  };
  usage: {
    totalFiles: number;
    totalMessages: number;
    totalQuizzes: number;
    totalFlashcards: number;
    totalPodcasts: number;
  };
  recentActivities: Array<{
    id: string;
    activity: string;
    metadata?: string;
    timestamp: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }>;
  topUsers: Array<{
    id: string;
    email: string;
    name: string;
    subscriptionStatus: string;
    _count: {
      File: number;
      Message: number;
      activities: number;
    };
  }>;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        toast.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Error fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      users: analytics.users,
      subscriptions: analytics.subscriptions,
      usage: analytics.usage,
      topUsers: analytics.topUsers,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      free: "bg-gray-100 text-gray-800",
      banned: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Failed to load analytics</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Platform insights and user activity monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportAnalytics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.users.recentRegistrations} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.subscriptions.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.subscriptions.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Files Processed
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.usage.totalFiles}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.usage.totalMessages} messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Features Used
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.usage.totalQuizzes +
                analytics.usage.totalFlashcards +
                analytics.usage.totalPodcasts}
            </div>
            <p className="text-xs text-muted-foreground">
              Quizzes, flashcards, podcasts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of user subscription statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Active Subscribers</span>
                </div>
                <span className="font-medium">{analytics.users.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Free Users</span>
                </div>
                <span className="font-medium">{analytics.users.free}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Banned Users</span>
                </div>
                <span className="font-medium">{analytics.users.banned}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>
              Active subscription plan breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.subscriptions.planDistribution.map((plan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{plan.planName}</span>
                  <span className="font-medium">{plan.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
          <CardDescription>Users with highest activity levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Activities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.subscriptionStatus)}
                  </TableCell>
                  <TableCell>{user._count.File}</TableCell>
                  <TableCell>{user._count.Message}</TableCell>
                  <TableCell>{user._count.activities}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>
            Latest user actions for chargeback protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivities.slice(0, 20).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <Activity className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-sm text-gray-500">
                      ({activity.user.email})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                  {activity.metadata && (
                    <p className="text-xs text-gray-500 mt-1">
                      {JSON.parse(activity.metadata).reason ||
                        activity.metadata}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
