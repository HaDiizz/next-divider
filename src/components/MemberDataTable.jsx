"use client";

import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { ChevronUpIcon, CaretSortIcon, ExitIcon } from "@radix-ui/react-icons";
import { Avatar, Button, Text } from "@mantine/core";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { removeMemberFromGroup } from "@/actions/memberAction";
import { modals } from "@mantine/modals";

const PAGE_SIZES = [10, 15, 20];

export default function MemberDataTable({
  members,
  owner,
  accountId,
  isLoading,
  refetch,
}) {
  const { data: session } = useSession();
  const [isKicking, setIsKicking] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "username",
    direction: "desc",
  });
  const [records, setRecords] = useState(members.slice(0, pageSize));
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    let dataSliced = members.slice(from, to);
    if (sortStatus) {
      dataSliced = sortBy(dataSliced, sortStatus.columnAccessor);
    }
    setRecords(
      sortStatus.direction === "desc" ? dataSliced.reverse() : dataSliced
    );
  }, [page, pageSize, sortStatus, members]);

  const handleKickFromGroup = async ({ userId, username }) => {
    modals.openConfirmModal({
      title: "นำออกจากกลุ่ม",
      centered: true,
      children: <Text size="sm">ต้องการนำ {username} ออกจากกลุ่มใช่ไหม</Text>,
      labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: async () => {
        setIsKicking(true);
        try {
          const response = await removeMemberFromGroup({ userId, accountId });
          if (response.error) {
            notifications.show({
              title: "เกิดข้อผิดพลาด",
              message: response?.message || "เตะออกจากกลุ่มไม่สำเร็จ",
              color: "red",
            });
          } else {
            refetch();
            notifications.show({
              title: "สำเร็จ",
              message: response?.message || "เตะออกจากกลุ่มสำเร็จ",
              color: "green",
            });
          }
        } catch (err) {
          notifications.show({
            title: "เกิดข้อผิดพลาด",
            message: err?.message || "เตะออกจากกลุ่มไม่สำเร็จ",
            color: "red",
          });
        } finally {
          setIsKicking(false);
        }
      },
    });
  };

  return (
    <div className="pt-10">
      <DataTable
        fetching={isLoading}
        height={400}
        className="table-auto"
        idAccessor={(record) => record._id}
        totalRecords={members.length}
        paginationActiveBackgroundColor="grape"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        records={records}
        columns={[
          {
            accessor: "image",
            title: "รูปโปรไฟล์",
            render: (record) => (
              <Avatar
                size="2rem"
                radius="md"
                name={record?.username}
                color="initials"
              />
            ),
          },
          {
            accessor: "username",
            title: "ชื่อผู้ใช้",
            sortable: true,
          },
          {
            accessor: "",
            textAlign: "center",
            render: (record) => (
              <div className="flex gap-x-3 justify-center">
                {session && owner && session.user._id === owner && (
                  <Button loading={isKicking} variant="transparent" radius="xl">
                    <ExitIcon
                      onClick={() =>
                        handleKickFromGroup({
                          userId: record._id,
                          username: record.username,
                        })
                      }
                      className="w-5 h-5 cursor-pointer text-red-500"
                    />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        sortIcons={{
          sorted: <ChevronUpIcon />,
          unsorted: <CaretSortIcon />,
        }}
      />
    </div>
  );
}
