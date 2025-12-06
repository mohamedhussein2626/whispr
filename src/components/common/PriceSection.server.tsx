import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PriceSectionClient from "../PricingSection";

export default async function PriceSection() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <PriceSectionClient session={session} />; // تمرير session كامل
}