import Investment from "@/components/pages/Investment";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getRefreshToken } from "@/actions/authAction";
import { getAssets, getOrders } from "@/actions/investmentAction";
import AssetDataTable from "@/components/AssetDataTable";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  }
  const dataAsset = await getAllAssets();
  const dataOrder = await getAllOrders();

  const secretKey = await getRefreshToken();
  return (
    <div className="pt-[8rem] p-5 md:p-24">
      <h1 className="font-bold text-neutral-400 py-3">Investment Overview</h1>
      <Investment secretKey={secretKey?.key || ""} />
      <AssetDataTable
        assets={dataAsset?.assets || []}
        orders={dataOrder?.orders}
      />
    </div>
  );
}

async function getAllAssets() {
  const response = await getAssets();
  if (response?.error) return [];
  return response;
}

async function getAllOrders() {
  const response = await getOrders();
  if (response?.error) return [];
  return response;
}
