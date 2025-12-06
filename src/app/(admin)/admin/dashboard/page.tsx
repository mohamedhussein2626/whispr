"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, CreditCard, Target } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  interval: string;
  status: string;
  createdAt: string;
}

interface Subscription {
  id: number;
  userId: string;
  userEmail: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, plansRes, subscriptionsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/plans"),
        fetch("/api/admin/subscriptions"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } else {
        console.error("Failed to fetch users:", usersRes.statusText);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans || []);
      } else {
        console.error("Failed to fetch plans:", plansRes.statusText);
      }

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        setSubscriptions(subscriptionsData.subscriptions || []);
      } else {
        console.error("Failed to fetch subscriptions:", subscriptionsRes.statusText);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      free: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      enabled: "bg-green-100 text-green-800",
      disabled: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"}
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your NotebookLama platform</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Plans
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="space-y-6">
        {/* Top Row - Users and Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No users yet</p>
                  <p className="text-sm">Users will appear here once they register</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 5).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.planName || "Free"}</TableCell>
                        <TableCell>
                          {getStatusBadge(user.subscriptionStatus || "free")}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => (window.location.href = "/admin/users")}
                >
                  View All Users
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plans Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plans ({plans.length})
              </CardTitle>
              <CardDescription>Available subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No plans available</p>
                  <p className="text-sm">Create your first subscription plan to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${plan.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">{plan.interval}</TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell>
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => (window.location.href = "/admin/plans/list")}
                >
                  View All Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Subscriptions (Full Width) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recent Subscriptions
            </CardTitle>
            <CardDescription>Latest subscription activity</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No subscriptions yet</p>
                <p className="text-sm">Active subscriptions will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.slice(0, 5).map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">{subscription.userEmail}</TableCell>
                      <TableCell>{subscription.planName}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => (window.location.href = "/admin/subscriptions")}
              >
                View All Subscriptions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
