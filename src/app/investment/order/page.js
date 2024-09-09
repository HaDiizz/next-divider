import { getOrders } from "@/actions/investmentAction";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OrderTable from "@/components/OrderTable";
import InvestmentOrder from "@/components/pages/InvestmentOrder";
import { Anchor, Breadcrumbs } from "@mantine/core";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  }
  const data = await getAllOrders();
  return (
    <div className="pt-[8rem] p-5 md:p-24">
      <h1 className="font-bold text-neutral-400 py-3">Order</h1>
      <Breadcrumbs>
        <Anchor href="/investment">Investment</Anchor>
        <Anchor underline="never">Order</Anchor>
      </Breadcrumbs>
      <InvestmentOrder />
      <OrderTable orders={data?.orders || []} />
    </div>
  );
}

async function getAllOrders() {
  const response = await getOrders();
  if (response?.error) return [];
  return response;
}
