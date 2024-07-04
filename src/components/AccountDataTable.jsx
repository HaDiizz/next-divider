"use client";

import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { accounts } from "@/utils/data";
import {
  EyeOpenIcon,
  ChevronUpIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";

const PAGE_SIZES = [10, 15, 20];

export default function AccountDataTable() {
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
  }, [page, pageSize, sortStatus]);

  return (
    <>
      <DataTable
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
          { accessor: "members", title: "จำนวนสมาชิกในบัญชี", sortable: true },
          { accessor: "allAssets", title: "จำนวนเงินโดยรวม", sortable: true },
          {
            accessor: "Action",
            textAlign: "center",
            render: (_) => (
              <span>
                <EyeOpenIcon className="w-5 h-5 cursor-pointer text-primary" />
              </span>
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
    </>
  );
}
