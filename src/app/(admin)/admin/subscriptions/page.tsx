"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { CreditCard, Search, Calendar, X, AlertTriangle, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subscription {
  id: number;
  userId: string;
  userEmail: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelingSubscription, setCancelingSubscription] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const filterSubscriptions = useCallback(() => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.planName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (sub) => sub.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscriptions");
      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterSubscriptions();
  }, [filterSubscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-gray-100 text-gray-800",
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

  const getPlanBadge = (planName: string) => {
    const planColors: { [key: string]: string } = {
      pro: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-green-100 text-green-800",
      free: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        className={
          planColors[planName.toLowerCase()] || "bg-gray-100 text-gray-800"
        }
      >
        {planName}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cancelSubscription = async (subscriptionId: number) => {
    try {
      setCancelingSubscription(subscriptionId);
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the subscriptions list
        await fetchSubscriptions();
        setNotification({ type: 'success', message: 'Subscription cancelled successfully' });
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({ type: 'error', message: `Failed to cancel subscription: ${data.message}` });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setNotification({ type: 'error', message: 'Failed to cancel subscription' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setCancelingSubscription(null);
    }
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
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions Management</h1>
          <p className="text-muted-foreground">Manage all user subscriptions</p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {subscriptions.filter((s) => s.status === "canceled").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                subscriptions.filter((s) => {
                  const startDate = new Date(s.startDate);
                  const now = new Date();
                  return (
                    startDate.getMonth() === now.getMonth() &&
                    startDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user email or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            All subscription records in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="font-medium">{subscription.userEmail}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {subscription.userId}
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(subscription.planName)}</TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{formatDate(subscription.startDate)}</TableCell>
                  <TableCell>
                    {subscription.endDate
                      ? formatDate(subscription.endDate)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {subscription.status === "active" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancelingSubscription === subscription.id}
                          >
                            {cancelingSubscription === subscription.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              Cancel Subscription
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this subscription? This action will:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Cancel the subscription in Stripe</li>
                                <li>Update the user&apos;s plan to &quot;free&quot;</li>
                                <li>Set the subscription status to &quot;canceled&quot;</li>
                                <li>Set the end date to today</li>
                              </ul>
                              <br />
                              <strong>User:</strong> {subscription.userEmail}<br />
                              <strong>Plan:</strong> {subscription.planName}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelSubscription(subscription.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Yes, Cancel Subscription
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {subscription.status !== "active" && (
                      <span className="text-muted-foreground text-sm">
                        No actions available
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsManagement;