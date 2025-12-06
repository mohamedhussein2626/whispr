"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Trash2,
  Ban,
  CreditCard,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  deleteUserAction,
  banUserAction,
  cancelSubscriptionAction,
  exportUserEmailsAction,
} from "@/lib/actions/adminUserActions";

interface UserActionButtonsProps {
  userId: string;
  userEmail: string;
  userName: string | null;
  subscriptionStatus: string | null;
  hasActiveSubscription: boolean;
  onUserDeleted?: () => void;
  onUserUpdated?: () => void;
}

export default function UserActionButtons({
  userId,
  userEmail,
  hasActiveSubscription,
  onUserDeleted,
  onUserUpdated,
}: UserActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success("User deleted successfully");
        setShowDeleteDialog(false);
        onUserDeleted?.();
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting user");
      console.error("error deleting user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }

    setLoading(true);
    try {
      const result = await banUserAction({ userId, banReason });
      if (result.success) {
        toast.success("User banned successfully");
        setShowBanDialog(false);
        setBanReason("");
        onUserUpdated?.();
      } else {
        toast.error(result.message || "Failed to ban user");
      }
    } catch (error) {
      toast.error("An error occurred while banning user");
      console.error("error ban user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const result = await cancelSubscriptionAction(userId);
      if (result.success) {
        toast.success("Subscription canceled successfully");
        setShowCancelDialog(false);
        onUserUpdated?.();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("An error occurred while canceling subscription");
      console.error("error cancel subs user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportEmails = async () => {
    setLoading(true);
    try {
      const result = await exportUserEmailsAction();
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || "users-export.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("User emails exported successfully");
      } else {
        toast.error(result.message || "Failed to export emails");
      }
    } catch (error) {
      toast.error("An error occurred while exporting emails");
      console.error("error export emails  user", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {hasActiveSubscription && (
            <DropdownMenuItem
              onClick={() => setShowCancelDialog(true)}
              className="text-orange-600"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Cancel Subscription
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowBanDialog(true)}
            className="text-yellow-600"
          >
            <Ban className="mr-2 h-4 w-4" />
            Ban User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportEmails}>
            <Download className="mr-2 h-4 w-4" />
            Export Emails
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userEmail}</strong>? This
              action will permanently remove the user and all their data,
              including files, messages, and subscription information. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-yellow-600" />
              Ban User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ban <strong>{userEmail}</strong> from using the platform. Their
              subscription will be canceled and they will lose access to all
              features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason for banning:</Label>
            <Input
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this user..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              disabled={loading || !banReason.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? "Banning..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cancel the subscription for <strong>{userEmail}</strong>. This
              will immediately cancel their Stripe subscription and downgrade
              them to free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Canceling..." : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
