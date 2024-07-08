"use client";
import { useState, useEffect } from "react";
import BackButton from "../BackButton";
import { MonthPickerInput } from "@mantine/dates";
import { Loader, Menu, Paper, Text } from "@mantine/core";
import moment from "moment";
import "moment/locale/th";
import TransactionDataTable from "../TransactionDataTable";
import CreateTransaction from "../CreateTransaction";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/actions/transactionAction";
import { formatNumber } from "@/utils/formatNumber";
import {
  DotsVerticalIcon,
  ExitIcon,
  Share1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { deleteAccountGroup, leaveAccountGroup } from "@/actions/accountAction";
import { useRouter } from "next/navigation";

moment.locale("th");

const AccountDetail = ({ accountId }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthSelected, setMonthSelected] = useState(new Date());
  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => await getTransactions(accountId, monthSelected),
    queryKey: ["transactions", accountId, monthSelected],
  });

  if (data?.error) return router.push("/");

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(
        process.env.BASE_URL
          ? `${process.env.BASE_URL}/invite/${accountId}`
          : `http://localhost:3000/invite/${accountId}`
      )
      .then(() => {
        notifications.show({
          title: "คัดลอกสำเร็จ",
          message: "นำ URL LINK ไปให้คนอื่นที่อยากให้เข้าร่วมกลุ่ม",
          color: "green",
        });
      })
      .catch((err) => {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: "คัดลอกไม่สำเร็จ",
          color: "green",
        });
      });
  };

  const handleLeaveGroup = async () => {
    if (confirm(`ต้องการออกจากบัญชี ${data?.account?.name} ใช่ไหม`)) {
      setIsLeaving(true);
      try {
        const response = await leaveAccountGroup(accountId);
        if (response.error) {
          notifications.show({
            title: "เกิดข้อผิดพลาด",
            message: response?.message || "ออกจากกลุ่ม/บัญชีไม่สำเร็จ",
            color: "red",
          });
        } else {
          refetch();
          notifications.show({
            title: "สำเร็จ",
            message: response?.message || "ออกจากกลุ่ม/บัญชีสำเร็จ",
            color: "green",
          });
          router.push("/");
        }
      } catch (err) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: err?.message || "ออกจากกลุ่ม/บัญชีไม่สำเร็จ",
          color: "red",
        });
      } finally {
        setIsLeaving(false);
      }
    }
  };
  const handleDeleteGroup = async () => {
    if (confirm(`ต้องการลบบัญชี ${data?.account?.name} ใช่ไหม`)) {
      setIsDeleting(true);
      try {
        const response = await deleteAccountGroup(accountId);
        if (response.error) {
          notifications.show({
            title: "เกิดข้อผิดพลาด",
            message: response?.message || "ลบกลุ่ม/บัญชีไม่สำเร็จ",
            color: "red",
          });
        } else {
          refetch();
          notifications.show({
            title: "สำเร็จ",
            message: response?.message || "ลบกลุ่ม/บัญชีสำเร็จ",
            color: "green",
          });
          router.push("/");
        }
      } catch (err) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: err?.message || "ลบกลุ่ม/บัญชีไม่สำเร็จ",
          color: "red",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };
  return (
    <>
      <div className="flex justify-between py-5">
        <BackButton />
        <div className="flex gap-x-3 items-center">
          <span className="text-primary">ข้อมูลเดือน</span>
          <MonthPickerInput
            placeholder="Pick date"
            value={monthSelected}
            onChange={setMonthSelected}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <Paper shadow="xs" withBorder p="xl" className="h-full">
            <Text gradient={{ from: "indigo", to: "blue", deg: 87 }}>
              มูลค่าทั้งหมด
            </Text>
            <div className="flex justify-center pt-5">
              {isLoading ? (
                <Loader color="indigo" type="dots" />
              ) : (
                <Text
                  size="3rem"
                  fw={900}
                  variant="gradient"
                  gradient={
                    data?.overallTotalAmount <= 0
                      ? { from: "red", to: "rgba(255, 74, 74, 1)", deg: 90 }
                      : { from: "green", to: "lime", deg: 90 }
                  }
                >
                  {formatNumber(data?.overallTotalAmount) || 0}
                </Text>
              )}
            </div>
          </Paper>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <Paper shadow="xs" withBorder p="xl" className="h-full">
            <Text gradient={{ from: "indigo", to: "blue", deg: 87 }}>
              มูลค่าในเดือน {moment(monthSelected).format("MMMM YYYY")}
            </Text>
            <div className="flex justify-center pt-5">
              {isLoading ? (
                <Loader color="indigo" type="dots" />
              ) : (
                <Text
                  size="3rem"
                  fw={900}
                  variant="gradient"
                  gradient={
                    data?.monthlyTotalAmount <= 0
                      ? { from: "red", to: "rgba(255, 74, 74, 1)", deg: 90 }
                      : { from: "green", to: "lime", deg: 90 }
                  }
                >
                  {formatNumber(data?.monthlyTotalAmount) || 0}
                </Text>
              )}
            </div>
          </Paper>
        </div>
        <div className="col-span-12 md:col-span-12 lg:col-span-6">
          <Paper shadow="xs" withBorder p="xl" className="h-full">
            <div className="flex justify-between">
              <Text fw={900}>รายละเอียดบัญชี</Text>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <DotsVerticalIcon className="hover:cursor-pointer" />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item
                    onClick={handleCopyLink}
                    leftSection={<Share1Icon />}
                  >
                    คัดลอกลิงก์
                  </Menu.Item>
                  <Menu.Label>Danger Zone</Menu.Label>
                  {session && session.user._id === data?.account?.owner?._id ? (
                    <Menu.Item
                      disabled={isDeleting}
                      onClick={() => handleDeleteGroup()}
                      color="red"
                      leftSection={<TrashIcon />}
                    >
                      ลบบัญชีถาวร
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      disabled={isLeaving}
                      onClick={() => handleLeaveGroup()}
                      color="red"
                      leftSection={<ExitIcon />}
                    >
                      {isLeaving ? "กำลังออกจากกลุ่ม..." : "ออกจากกลุ่ม"}
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader color="indigo" type="dots" />
              </div>
            ) : (
              <div className="flex flex-col justify-center pt-5">
                <table className="table-auto">
                  <tbody>
                    <tr>
                      <td className="w-[18rem] md:w-[30rem]">ชื่อบัญชี</td>
                      <td className="w-[18rem] md:w-[30rem]">
                        {data.account?.name}
                      </td>
                    </tr>
                    <tr>
                      <td>เจ้าของบัญชี</td>
                      <td className="w-[18rem] md:w-[30rem]">
                        {data.account?.owner?.username}
                      </td>
                    </tr>
                    <tr>
                      <td>ภาพรวม</td>
                      <td className="w-[18rem] md:w-[30rem]">
                        <div className="flex flex-col laptop:flex-row">
                          <table>
                            <tbody>
                              <tr>
                                <td className="flex flex-col md:flex-row gap-x-10">
                                  <div className="flex gap-x-2 text-green-500">
                                    <span className="py-2 font-bold">I</span>
                                    <span className="py-2">
                                      {formatNumber(data?.totalIncome)}
                                    </span>
                                  </div>
                                  <div className="flex gap-x-2 text-red-500">
                                    <span className="py-2 font-bold">E</span>
                                    <span className="py-2">
                                      {formatNumber(data?.totalExpense)}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Paper>
        </div>
      </div>
      <div className="flex justify-end pt-8">
        <CreateTransaction accountId={accountId} refetch={refetch} />
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <TransactionDataTable
            transactions={data?.transactions || []}
            isLoading={isLoading}
            refetch={refetch}
          />
        </div>
      </div>
    </>
  );
};

export default AccountDetail;
