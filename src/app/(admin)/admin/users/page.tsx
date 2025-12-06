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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  Download, 
  Ban, 
  Trash2, 
  Eye, 
  Activity,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  planName: string;
  subscriptionStatus: string;
  isBanned?: boolean;
  banReason?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  ipAddress?: string;
  userAgent?: string;
  _count: {
    File: number;
    Message: number;
    subscriptions: number;
  };
  activities?: UserActivity[];
  subscriptions?: Subscription[];
}

interface UserActivity {
  id: string;
  activity: string;
  metadata?: string;
  timestamp: string;
}

interface Subscription {
  id: number;
  status: string;
  startDate: string;
  endDate?: string;
  plan: {
    name: string;
    price: number;
    interval: string;
  };
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.planName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setIsUserDetailOpen(true);
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error fetching user details");
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, action: "ban", reason: banReason }),
      });

      if (response.ok) {
        toast.success("User banned successfully");
        setIsBanDialogOpen(false);
        setBanReason("");
        fetchUsers();
      } else {
        toast.error("Failed to ban user");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Error banning user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "unban" }),
      });
      if (response.ok) {
        toast.success("User unbanned successfully");
        fetchUsers();
      } else {
        toast.error("Failed to unban user");
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Error unbanning user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Subscription cancelled successfully");
        fetchUsers();
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Error cancelling subscription");
    }
  };

  const exportUserEmails = () => {
    const emails = users.map(user => user.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-emails.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("User emails exported successfully");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { className: string; icon: React.ReactNode } } = {
      active: { 
        className: "bg-green-100 text-green-800", 
        icon: <CheckCircle className="w-3 h-3" />
      },
      canceled: { 
        className: "bg-red-100 text-red-800", 
        icon: <XCircle className="w-3 h-3" />
      },
      free: { 
        className: "bg-gray-100 text-gray-800", 
        icon: <Users className="w-3 h-3" />
      },
      banned: { 
        className: "bg-red-100 text-red-800", 
        icon: <Ban className="w-3 h-3" />
      },
      pending: { 
        className: "bg-yellow-100 text-yellow-800", 
        icon: <AlertTriangle className="w-3 h-3" />
      },
    };

    const config = statusMap[status.toLowerCase()] || statusMap.free;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, subscriptions, and monitor usage</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportUserEmails} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Emails
          </Button>
          <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscriptionStatus === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscriptionStatus === "free").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscriptionStatus === "banned").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email, name, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Users will appear here once they register</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.planName}</TableCell>
                    <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                    <TableCell>{user._count.File}</TableCell>
                    <TableCell>{user._count.Message}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchUserDetails(user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.subscriptionStatus === "banned" || user.isBanned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsBanDialogOpen(true);
                            }}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="text-sm text-gray-600">{selectedUser.planName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.subscriptionStatus)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registration Date</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </p>
                </div>
                {selectedUser.ipAddress && (
                  <div>
                    <Label className="text-sm font-medium">Registration IP</Label>
                    <p className="text-sm text-gray-600">{selectedUser.ipAddress}</p>
                  </div>
                )}
                {selectedUser.lastLoginAt && (
                  <div>
                    <Label className="text-sm font-medium">Last Login</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedUser.lastLoginAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Usage Stats */}
              <div>
                <Label className="text-sm font-medium">Usage Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{selectedUser._count.File}</div>
                    <div className="text-sm text-gray-600">Files Uploaded</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{selectedUser._count.Message}</div>
                    <div className="text-sm text-gray-600">Messages Sent</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{selectedUser._count.subscriptions}</div>
                    <div className="text-sm text-gray-600">Subscriptions</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {selectedUser.activities && selectedUser.activities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Recent Activity</Label>
                  <div className="mt-2 space-y-2">
                    {selectedUser.activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.activity}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscriptions */}
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Subscriptions</Label>
                  <div className="mt-2 space-y-2">
                    {selectedUser.subscriptions.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{subscription.plan.name}</p>
                          <p className="text-sm text-gray-600">
                            ${subscription.plan.price}/{subscription.plan.interval}
                          </p>
                          <p className="text-xs text-gray-500">
                            Started: {new Date(subscription.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(subscription.status)}
                          {subscription.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Reason for ban</Label>
              <Input
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.name}? 
              This action cannot be undone and will remove all user data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;