"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { toast } from "sonner";
import {
  Loader2,
  Star,
  Zap,
  FileText,
  Tag,
  DollarSign,
  Calendar,
  Folder,
  PenTool,
  CheckSquare,
} from "lucide-react";
import { updatePlanAction } from "@/lib/actions/updatePlan";

type IntervalType = "monthly" | "yearly" | "lifetime";
type PlanStatus = "ACTIVE" | "HIDDEN" | "DISABLED";

interface PlanFormData {
  name: string;
  description: string;
  features: string;
  price: number;
  interval: IntervalType;
  numberOfFiles: number;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  status: PlanStatus;
  isPopular: boolean;
  priceId: string;
}

export default function EditPlanPage() {
  const { plans, fetchPlans } = useAdminAuth();
  const router = useRouter();
  const params = useParams();

  const planId = Number(params.id);
  const existingPlan = plans.find((p) => p.id === planId);

  const [form, setForm] = useState<PlanFormData>({
    name: "",
    description: "",
    features: "",
    price: 0,
    interval: "monthly",
    numberOfFiles: 0,
    numberOfEssayWriter: 0,
    numberOfEssayGrader: 0,
    status: "ACTIVE",
    isPopular: false,
    priceId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingPlan) {
      setForm({
        name: existingPlan.name || "",
        description: existingPlan.description || "",
        features: existingPlan.features || "",
        price: existingPlan.price,
        interval: existingPlan.interval,
        numberOfFiles: existingPlan.numberOfFiles || 0,
        numberOfEssayWriter: existingPlan.numberOfEssayWriter || 0,
        numberOfEssayGrader: existingPlan.numberOfEssayGrader || 0,
        status: existingPlan.status,
        isPopular: existingPlan.isPopular,
        priceId: existingPlan.priceId || "",
      });
    }
  }, [existingPlan]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["price", "numberOfFiles", "numberOfEssayWriter", "numberOfEssayGrader"].includes(name)
        ? +value
        : value,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!existingPlan) return;
    setLoading(true);
    try {
      const result = await updatePlanAction(planId, form);
      if (result.success) {
        toast.success("Plan Updated Successfully");
        fetchPlans();
        router.push("/admin/plans/list");
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [planId, form, existingPlan, fetchPlans, router]);

  if (!existingPlan) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        Loading plan data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Plan Name
              </Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="h-12 text-lg border-2"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Description
              </Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="min-h-[100px] border-2"
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Features
              </Label>
              <Textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                className="min-h-[150px] border-2"
              />
              <p className="text-xs text-slate-500">
                Use commas or new lines to separate each feature
              </p>
            </div>

            {/* Price & Interval */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Price ($)
                </Label>
                <Input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="h-12 text-lg border-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Billing Interval
                </Label>
                <select
                  name="interval"
                  value={form.interval}
                  onChange={handleChange}
                  className="h-12 w-full text-lg border-2 rounded-md px-3 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Folder className="h-4 w-4" /> Number of Files
                </Label>
                <Input
                  type="number"
                  name="numberOfFiles"
                  value={form.numberOfFiles}
                  onChange={handleChange}
                  className="h-12 text-lg border-2"
                  placeholder="0 = unlimited"
                />
              </div>
            </div>

            {/* Essay Writer and Grader Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" /> Number of Essay Writer
                </Label>
                <Input
                  type="number"
                  name="numberOfEssayWriter"
                  value={form.numberOfEssayWriter}
                  onChange={handleChange}
                  className="h-12 text-lg border-2"
                  placeholder="0 = unlimited"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" /> Number of Essay Grader
                </Label>
                <Input
                  type="number"
                  name="numberOfEssayGrader"
                  value={form.numberOfEssayGrader}
                  onChange={handleChange}
                  className="h-12 text-lg border-2"
                  placeholder="0 = unlimited"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Plan Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-12 w-full border-2 rounded-md px-3 bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="HIDDEN">Hidden</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>

            {/* Popular */}
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <Checkbox
                checked={form.isPopular}
                onCheckedChange={(checked: unknown) =>
                  setForm((prev) => ({ ...prev, isPopular: !!checked }))
                }
              />
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <Label className="text-base font-semibold text-yellow-800">
                  Mark as Popular Plan
                </Label>
              </div>
            </div>

            {/* Stripe Price ID */}
            <div>
              <Label className="flex items-center gap-2">
                Stripe Price ID
              </Label>
              <Input
                name="priceId"
                value={form.priceId}
                onChange={handleChange}
                placeholder="e.g., price_1OxY2pAbCdEfGhIjKlMn"
                className="h-12 text-lg border-2"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 flex justify-center items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Update Plan"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
