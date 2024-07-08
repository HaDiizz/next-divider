import { getAccount } from "@/actions/accountAction";
import { getTransactions } from "@/actions/transactionAction";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AccountDetail from "@/components/pages/AccountDetail";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

const Page = async ({ params }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  }
  const response = await getAccount(params.id);
  if (response?.error) redirect("/");
  if (
    response.account.owner !== session.user._id &&
    !response?.account?.members.some(
      (member) => member?.toString() === session?.user?._id
    )
  ) {
    redirect("/");
  }

  const data = await getTransactions(params.id);
  return (
    <div className="pt-[8rem] p-5 md:p-24">
      <AccountDetail
        accountId={params.id}
        transactions={data?.transactions || []}
        totalAmount={data?.totalAmount || 0}
      />
    </div>
  );
};

export default Page;
