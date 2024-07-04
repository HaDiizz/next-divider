import SignUpForm from "@/components/auth/SignUpForm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }
  return (
    <div className="h-screen pt-[4rem] md:pt-[4rem] max-w-7xl mx-auto flex justify-center gap-x-5 p-5 items-center">
      <SignUpForm />
    </div>
  );
};

export default Page;
