"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  DollarSign,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import DeletePlanButton from "../DeletePlanButton";

const PLANS_PER_PAGE = 5;

type IntervalType = "monthly" | "yearly" | "lifetime";
type PlanStatus = "ACTIVE" | "HIDDEN" | "DISABLED";

interface Plan {
  id: number;
  name: string;
  description?: string;
  features?: string;
  price: number;
  interval: IntervalType;
  status: PlanStatus;
  isPopular: boolean;
  numberOfFiles: number; //
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error("Failed to fetch plans");
      }
    } catch {
      toast.error("Failed to fetch plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const totalPages = Math.ceil(plans.length / PLANS_PER_PAGE);
  const paginatedPlans = plans.slice(
    (currentPage - 1) * PLANS_PER_PAGE,
    currentPage * PLANS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <div className="flex justify-between mb-4">
        <CardTitle className="text-xl">All Plans</CardTitle>
        <Button onClick={() => router.push("/admin/plans/add")}>
          + Add New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plans Table</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner className="h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Essay Writer</TableHead>
                  <TableHead>Essay Grader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center py-10 text-gray-500"
                    >
                      No plans available yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {plan.description || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {plan.features || "-"}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />{" "}
                        {plan.price.toFixed(2)}
                      </TableCell>
                      <TableCell>{plan.interval}</TableCell>
                      <TableCell>{plan.numberOfFiles}</TableCell>
                      <TableCell>{plan.numberOfEssayWriter}</TableCell>
                      <TableCell>{plan.numberOfEssayGrader}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            plan.status === "ACTIVE"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : undefined
                          }
                          variant={
                            plan.status === "ACTIVE" ? undefined : "destructive"
                          }
                        >
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.isPopular && (
                          <BadgeCheck className="text-primary w-5 h-5" />
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/plans/${plan.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeletePlanButton
                          planId={plan.id}
                          onDeleted={fetchPlans}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {plans.length > 0 && totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} stroke="black" />
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} stroke="black" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
