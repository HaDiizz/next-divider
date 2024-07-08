"use client";

import { getInviteAccount, joinAccountGroup } from "@/actions/accountAction";
import { Button, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const Page = ({ params }) => {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const { data: session } = useSession();
  const { data, isLoading } = useQuery({
    queryFn: async () => await getInviteAccount(params.accountId),
    queryKey: ["account", params.accountId],
  });

  useEffect(() => {
    if (!session) router.push("/sign-in");
  }, [session, router]);

  if (data?.error) return router.push("/");

  const handleJoinTheGroup = async () => {
    setIsJoining(true);
    try {
      const response = await joinAccountGroup(params.accountId);
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "เข้าร่วมไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "เข้าร่วมสำเร็จ",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: err?.message || "เข้าร่วมไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <form action={handleJoinTheGroup}>
        {isLoading ? (
          <Loader color="indigo" type="dots" />
        ) : session ? (
          <div className="flex flex-col gap-y-6 justify-center">
            <div className="flex justify-center gap-y-2 flex-col items-center align-middle">
              <span className="text-4xl">
                คุณต้องการเข้าร่วมกลุ่ม {data.account.name} หรือไม่ ?
              </span>
              <span className="text-xl">เจ้าของบัญชี {data.account.owner}</span>
            </div>

            <div className="flex justify-center">
              <Button
                loading={isJoining}
                className="bg-primary"
                type="submit"
                variant="outline"
                size="sm"
                radius="md"
              >
                ยืนยันเข้าร่วมบัญชีร่วม
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default Page;
