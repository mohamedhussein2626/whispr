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
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Download,
  Eye,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface ChargebackRiskUser {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: string;
  createdAt: string;
  subscriptions: Array<{
    id: number;
    status: string;
    startDate: string;
    plan: {
      name: string;
      price: number;
    };
  }>;
  _count: {
    activities: number;
    File: number;
    Message: number;
  };
}

interface ChargebackData {
  lowActivityUsers: ChargebackRiskUser[];
  highActivityUsers: ChargebackRiskUser[];
  riskScore: number;
  totalActiveUsers: number;
  riskUsersCount: number;
}

const ChargebackProtectionPage = () => {
  const [data, setData] = useState<ChargebackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChargebackData();
  }, []);

  const fetchChargebackData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/chargeback-protection");
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        toast.error("Failed to fetch chargeback data");
      }
    } catch (error) {
      console.error("Error fetching chargeback data:", error);
      toast.error("Error fetching chargeback data");
    } finally {
      setLoading(false);
    }
  };

  const exportRiskUsers = () => {
    if (!data) return;

    const riskUsers = data.lowActivityUsers.map(user => ({
      email: user.email,
      name: user.name,
      subscriptionDate: user.subscriptions[0]?.startDate,
      plan: user.subscriptions[0]?.plan.name,
      price: user.subscriptions[0]?.plan.price,
      activities: user._count.activities,
      files: user._count.File,
      messages: user._count.Message,
      riskLevel: "HIGH",
    }));

    const csvContent = [
      "Email,Name,Subscription Date,Plan,Price,Activities,Files,Messages,Risk Level",
      ...riskUsers.map(user => 
        `${user.email},${user.name},${user.subscriptionDate},${user.plan},${user.price},${user.activities},${user.files},${user.messages},${user.riskLevel}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chargeback-risk-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Risk users exported successfully");
  };

  const getRiskLevel = (user: ChargebackRiskUser) => {
    const daysSinceSubscription = Math.floor(
      (new Date().getTime() - new Date(user.subscriptions[0]?.startDate || user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const activityScore = user._count.activities + user._count.File + user._count.Message;
    
    if (daysSinceSubscription > 7 && activityScore === 0) {
      return { level: "HIGH", color: "bg-red-100 text-red-800" };
    } else if (daysSinceSubscription > 3 && activityScore < 3) {
      return { level: "MEDIUM", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { level: "LOW", color: "bg-green-100 text-green-800" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Failed to load chargeback data</p>
          <Button onClick={fetchChargebackData} className="mt-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Chargeback Protection</h1>
          <p className="text-gray-600 mt-1">Monitor user activity to prevent fraudulent chargebacks</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportRiskUsers} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Risk Users
          </Button>
          <Button onClick={fetchChargebackData} variant="outline" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.riskScore}%</div>
            <p className="text-xs text-muted-foreground">
              {data.riskScore < 10 ? "Low Risk" : data.riskScore < 25 ? "Medium Risk" : "High Risk"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              With active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.riskUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Low activity users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Good Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.highActivityUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              High activity users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            High Risk Users ({data.lowActivityUsers.length})
          </CardTitle>
          <CardDescription>
            Users with active subscriptions but low activity - potential chargeback risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.lowActivityUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p className="text-lg font-medium">No high risk users found</p>
              <p className="text-sm">All users are showing good activity levels</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowActivityUsers.map((user) => {
                  const risk = getRiskLevel(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.subscriptions[0]?.plan.name}</div>
                          <div className="text-sm text-gray-500">
                            ${user.subscriptions[0]?.plan.price}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={risk.color}>
                          {risk.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count.activities}</TableCell>
                      <TableCell>{user._count.File}</TableCell>
                      <TableCell>{user._count.Message}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Good Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            High Activity Users ({data.highActivityUsers.length})
          </CardTitle>
          <CardDescription>
            Users with good activity levels - low chargeback risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.highActivityUsers.slice(0, 10).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.subscriptions[0]?.plan.name}</div>
                      <div className="text-sm text-gray-500">
                        ${user.subscriptions[0]?.plan.price}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user._count.activities}</TableCell>
                  <TableCell>{user._count.File}</TableCell>
                  <TableCell>{user._count.Message}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChargebackProtectionPage;
