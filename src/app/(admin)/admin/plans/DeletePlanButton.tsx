

"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePlan } from "@/lib/actions/deletePlan";
export default function DeletePlanButton({
  planId,
  onDeleted,
}: {
  planId: number;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePlan(planId);

      if (result.success) {
        toast.success("Plan deleted successfully");
        onDeleted?.(); // optional callback to refetch or update UI
      } else {
        toast.error(result.message || "Failed to delete plan");
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}