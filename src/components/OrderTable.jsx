"use client";
import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { ChevronUpIcon, CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { deleteOrder } from "@/actions/investmentAction";

const PAGE_SIZES = [10, 15, 20];

export default function OrderTable({ orders }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "createdAt",
    direction: "asc",
  });
  const [records, setRecords] = useState(orders.slice(0, pageSize));

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    let dataSliced = orders.slice(from, to);
    if (sortStatus) {
      dataSliced = sortBy(dataSliced, sortStatus.columnAccessor);
    }
    setRecords(
      sortStatus.direction === "desc" ? dataSliced.reverse() : dataSliced
    );
  }, [page, pageSize, sortStatus, orders]);

  const handleDeleteOrder = async (id, symbol) => {
    modals.openConfirmModal({
      title: "ลบรายการ",
      centered: true,
      children: <Text size="sm">ต้องการลบรายการ {symbol} ใช่ไหม</Text>,
      labels: { confirm: "ยืนยันลบรายการ", cancel: "ยกเลิก" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await deleteOrder(id);
          if (response.error) {
            notifications.show({
              title: "เกิดข้อผิดพลาด",
              message: response?.message || "ลบรายการไม่สำเร็จ",
              color: "red",
            });
          } else {
            notifications.show({
              title: "สำเร็จ",
              message: response?.message || "ลบรายการสำเร็จ",
              color: "green",
            });
          }
        } catch (err) {
          notifications.show({
            title: "เกิดข้อผิดพลาด",
            message: err?.message || "ลบรายการไม่สำเร็จ",
            color: "red",
          });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <div className="pt-10">
      <DataTable
        height={400}
        className="table-auto"
        idAccessor={(record) => record._id}
        withTableBorder
        withColumnBorders
        totalRecords={orders.length}
        paginationActiveBackgroundColor="grape"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        records={records}
        columns={[
          { accessor: "orderId", title: "Order ID", sortable: true },
          { accessor: "symbol", title: "สินทรัพย์", sortable: true },
          {
            accessor: "assetType",
            title: "ประเภทสินทรัพย์",
            sortable: true,
          },
          {
            accessor: "quantity",
            title: "จำนวนสินทรัพย์",
            sortable: true,
          },
          {
            accessor: "open",
            title: "ราคาเปิด (USD)",
            sortable: true,
          },
          {
            accessor: "close",
            title: "ราคาปิด (USD)",
            sortable: true,
          },
          {
            accessor: "status",
            title: "สถานะ",
            sortable: true,
          },
          {
            accessor: "profitLoss",
            title: "กำไร/ขาดทุน (USD)",
            sortable: true,
            render: (record) => (
              <span
                className={`transition-colors duration-500 ${
                  record.profitLoss > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {record.profitLoss === 0
                  ? 0
                  : record.profitLoss
                  ? record.profitLoss.toFixed(2)
                  : "-"}
              </span>
            ),
          },
          {
            accessor: "profitLossPercentage",
            title: "กำไร/ขาดทุน (%)",
            sortable: true,
            render: (record) => (
              <span
                className={`transition-colors duration-500 ${
                  record.profitLossPercentage > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {record.profitLossPercentage === 0
                  ? `0.00%`
                  : record.profitLossPercentage
                  ? `${record.profitLossPercentage.toFixed(2)}%`
                  : "-"}
              </span>
            ),
          },
          {
            accessor: "",
            textAlign: "center",
            render: (record) => (
              <div className="flex gap-x-3 justify-center">
                <Button loading={isDeleting} variant="transparent" radius="xl">
                  <TrashIcon
                    onClick={() => handleDeleteOrder(record._id, record.symbol)}
                    className="w-5 h-5 cursor-pointer text-red-500"
                  />
                </Button>
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
