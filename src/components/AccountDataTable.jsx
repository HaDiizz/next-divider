"use client";

import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { ChevronUpIcon, CaretSortIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatNumber } from "@/utils/formatNumber";
import { nprogress } from "@mantine/nprogress";

const PAGE_SIZES = [10, 15, 20];

export default function AccountDataTable({ accounts }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });
  const [records, setRecords] = useState(accounts.slice(0, pageSize));

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    let dataSliced = accounts.slice(from, to);
    if (sortStatus) {
      dataSliced = sortBy(dataSliced, sortStatus.columnAccessor);
    }
    setRecords(
      sortStatus.direction === "desc" ? dataSliced.reverse() : dataSliced
    );
  }, [page, pageSize, sortStatus, accounts]);

  return (
    <div className="pt-10">
      <DataTable
        pinLastColumn
        height={400}
        className="table-auto"
        idAccessor={(record) => record._id}
        withTableBorder
        withColumnBorders
        totalRecords={accounts.length}
        paginationActiveBackgroundColor="grape"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        records={records}
        columns={[
          { accessor: "name", title: "ชื่อบัญชี", sortable: true },
          {
            accessor: "members",
            title: "จำนวนสมาชิกในบัญชี",
            sortable: true,
            render: (record) => formatNumber(record?.members?.length),
          },
          {
            accessor: "totalAmount",
            title: "จำนวนเงินโดยรวม (บาท)",
            sortable: true,
            render: (record) => formatNumber(record?.totalAmount),
          },
          {
            accessor: "",
            textAlign: "center",
            render: (record) => (
              <div className="flex justify-center">
                <Link href={`/account/${record._id}`}>
                  <svg
                    className="w-5 h-5 cursor-pointer text-primary dark:text-secondary"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    onClick={() => nprogress.start()}
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </Link>
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
