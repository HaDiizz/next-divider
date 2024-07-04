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
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <CreateAccount />
      <AccountDataTable />
    </div>
  );
}
