"use client";

import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import {
  ChevronUpIcon,
  CaretSortIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import moment from "moment";
import Image from "next/image";
import { Badge } from "@mantine/core";
import { formatNumber } from "@/utils/formatNumber";
import { useSession } from "next-auth/react";

const PAGE_SIZES = [10, 15, 20];

export default function TransactionDataTable({ transactions, isLoading }) {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });
  const [records, setRecords] = useState(transactions.slice(0, pageSize));
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    let dataSliced = transactions.slice(from, to);
    if (sortStatus) {
      dataSliced = sortBy(dataSliced, sortStatus.columnAccessor);
    }
    setRecords(
      sortStatus.direction === "desc" ? dataSliced.reverse() : dataSliced
    );
  }, [page, pageSize, sortStatus, transactions]);

  return (
    <div className="pt-10">
      <DataTable
        fetching={isLoading}
        height={400}
        className="table-auto"
        idAccessor={(record) => record._id}
        withTableBorder
        withColumnBorders
        totalRecords={transactions.length}
        paginationActiveBackgroundColor="grape"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        records={records}
        columns={[
          { accessor: "name", title: "ชื่อรายการ", sortable: true },
          {
            accessor: "amount",
            title: "จำนวนเงิน (บาท)",
            sortable: true,
            render: (record) => formatNumber(record?.amount),
          },
          {
            accessor: "category",
            title: "หมวดหมู่",
            sortable: true,
            render: (record) => record?.category,
          },
          {
            accessor: "type",
            title: "ประเภท",
            sortable: true,
            render: (record) => (
              <Badge color={`${record?.type === "income" ? "green" : "red"}`}>
                {record?.type === "income" ? "รายรับ" : "รายจ่าย"}
              </Badge>
            ),
          },
          {
            accessor: "date",
            title: "วันที่",
            sortable: true,
            render: (record) => moment(record?.date).format("DD MMMM YYYY"),
          },
          {
            accessor: "user",
            title: "ผู้รายงาน",
            sortable: true,
            render: (record) => record?.user?.username,
          },
          {
            accessor: "image",
            title: "รูปภาพเพิ่มเติม",
            render: (record) =>
              record?.image ? (
                <Image
                  src={record.image}
                  widht={100}
                  height={100}
                  alt="image"
                  priority
                />
              ) : (
                "-"
              ),
          },
          {
            accessor: "remark",
            title: "หมายเหตุ",
            sortable: true,
            render: (record) => record?.remark || "-",
          },
          {
            accessor: "",
            textAlign: "center",
            render: (record) => (
              <div className="flex gap-x-3 justify-center">
                {session.user._id === record.user._id && (
                  <>
                    <Link href={`/account/${record._id}`}>
                      <Pencil2Icon className="w-5 h-5 cursor-pointer text-primary" />
                    </Link>
                    <Link href={`/account/${record._id}`}>
                      <TrashIcon className="w-5 h-5 cursor-pointer text-red-500" />
                    </Link>
                  </>
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
