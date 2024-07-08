import { getAccounts } from "@/actions/accountAction";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AccountDataTable from "@/components/AccountDataTable";
import CreateAccount from "@/components/CreateAccount";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  }
  const data = await getAllAccounts();
  return (
    <div className="pt-[8rem] p-5 md:p-24">
      <h1 className="font-bold text-neutral-500 py-3">รายการบัญชี</h1>
      <CreateAccount />
      <AccountDataTable accounts={data?.accounts || []} />
    </div>
  );
}

async function getAllAccounts() {
  const response = await getAccounts();
  if (response?.error) return [];
  return response;
}
