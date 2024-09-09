"use client";

import { DataTable } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { ChevronUpIcon, CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button, Switch, Text } from "@mantine/core";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { getColorChangeClass } from "@/utils/getColorChangeClass";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { deleteAsset, updateFixedAsset } from "@/actions/investmentAction";

const PAGE_SIZES = [10, 15, 20];

export default function AssetDataTable({ assets, orders }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "symbol",
    direction: "asc",
  });
  const [records, setRecords] = useState(assets.slice(0, pageSize));

  const symbols = assets.map((asset) => asset.symbol);

  const { realTimePrices, previousPrices } = useBinanceWebSocket(symbols);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    let dataSliced = assets.slice(from, to);
    if (sortStatus) {
      dataSliced = sortBy(dataSliced, sortStatus.columnAccessor);
    }
    setRecords(
      sortStatus.direction === "desc" ? dataSliced.reverse() : dataSliced
    );
  }, [page, pageSize, sortStatus, assets]);

  const handleDeleteAsset = async (assetId, symbol) => {
    modals.openConfirmModal({
      title: "ลบรายการ",
      centered: true,
      children: <Text size="sm">ต้องการลบสินทรัพย์ {symbol} ใช่ไหม</Text>,
      labels: { confirm: "ยืนยันลบสินทรัพย์", cancel: "ยกเลิก" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await deleteAsset(assetId);
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

  const handleUpdateIsFixed = async (assetId, isFixed) => {
    try {
      const response = await updateFixedAsset(assetId, isFixed);
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "เปลี่ยนไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "เปลี่ยนสำเร็จ",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: err?.message || "เปลี่ยนไม่สำเร็จ",
        color: "red",
      });
    }
  };

  const calculateProfitLoss = (asset) => {
    const currentPrice = realTimePrices[asset.symbol] || 0;
    const ordersForAsset = orders.filter(
      (order) => order.symbol === asset.symbol
    );

    let profitLoss = 0;
    ordersForAsset.forEach((order) => {
      const price = order.status === "closed" ? order.close : currentPrice;
      profitLoss += (price - order.open) * order.quantity;
    });

    return profitLoss;
  };

  const calculateTotalValue = (asset) => {
    const currentPrice = realTimePrices[asset.symbol] || 0;
    const ordersForAsset = orders.filter(
      (order) => order.symbol === asset.symbol
    );

    let totalValue = 0;
    ordersForAsset.forEach((order) => {
      const price = order.status === "closed" ? order.close : currentPrice;
      totalValue += price * order.quantity;
    });

    return totalValue;
  };

  return (
    <div className="pt-10">
      <DataTable
        height={400}
        className="table-auto"
        idAccessor={(record) => record._id}
        withTableBorder
        withColumnBorders
        totalRecords={assets.length}
        paginationActiveBackgroundColor="grape"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        records={records.map((asset) => ({
          ...asset,
          profitLossRealtime: calculateProfitLoss(asset),
          totalValueRealtime: calculateTotalValue(asset),
        }))}
        columns={[
          { accessor: "symbol", title: "สินทรัพย์", sortable: true },
          {
            accessor: "quantity",
            title: "จำนวนสินทรัพย์",
            sortable: true,
          },
          {
            accessor: "averageBuyPrice",
            title: "ราคาซื้อโดยเฉลี่ย (USD)",
            sortable: true,
          },
          {
            accessor: "currentPrice",
            title: "ราคาปัจจุบัน",
            render: (record) => (
              <span
                className={`transition-colors duration-200 ${getColorChangeClass(
                  realTimePrices[record.symbol],
                  previousPrices[record.symbol]
                )}`}
              >
                {realTimePrices[record.symbol]
                  ? Number(realTimePrices[record.symbol])
                  : "Loading..."}
              </span>
            ),
          },
          {
            accessor: "totalValue",
            title: "มูลค่าทั้งหมด",
            sortable: true,
            render: (record) => (
              <span>
                {record.totalValue === 0
                  ? 0
                  : record.totalValueRealtime
                  ? record.totalValueRealtime.toFixed(2)
                  : "Loading..."}
              </span>
            ),
          },
          {
            accessor: "profitLoss",
            title: "กำไร/ขาดทุน",
            sortable: true,
            render: (record) => (
              <span
                className={`transition-colors duration-500 ${
                  record.profitLoss > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {record.profitLoss === 0
                  ? 0
                  : record.profitLossRealtime
                  ? record.profitLossRealtime.toFixed(2)
                  : "Loading..."}
              </span>
            ),
          },
          {
            accessor: "isFixed",
            title: "ใช้บอทเทรด",
            sortable: true,
            render: (record) => (
              <div className="flex justify-center">
                <Switch
                  className="cursor-pointer"
                  size="md"
                  onLabel="Yes"
                  offLabel="No"
                  checked={!record.isFixed}
                  onChange={(event) =>
                    handleUpdateIsFixed(
                      record._id,
                      !event.currentTarget.checked
                    )
                  }
                />
              </div>
            ),
          },
          {
            accessor: "",
            textAlign: "center",
            render: (record) => (
              <div className="flex gap-x-3 justify-center">
                <Button loading={isDeleting} variant="transparent" radius="xl">
                  <TrashIcon
                    onClick={() => handleDeleteAsset(record._id, record.symbol)}
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
