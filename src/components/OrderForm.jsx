"use client";
import React from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  Group,
  Loader,
  Select,
  TextInput,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import Image from "next/image";
import { CheckIcon } from "@radix-ui/react-icons";
import { notifications } from "@mantine/notifications";
import {
  createAsset,
  createOrder,
  getSymbols,
} from "@/actions/investmentAction";
import { useQuery } from "@tanstack/react-query";
import { fetchSymbols } from "@/services/assetService";

const symbolsFilter = ({ options, search }) => {
  const filtered = options.filter((option) =>
    option.label.toLowerCase().trim().includes(search.toLowerCase().trim())
  );

  filtered.sort((a, b) => a.label.localeCompare(b.label));
  return filtered;
};

const OrderForm = ({ close }) => {
  const [isShowCloseInput, setIsShowCloseInput] = React.useState(false);
  const [assetType, setAssetType] = React.useState("crypto");
  const {
    data: symbols = [],
    isLoading: IsLoadingSymbols,
    refetch,
  } = useQuery({
    queryFn: async () => await getSymbols(),
    queryKey: ["symbols"],
    enabled: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      symbol: "",
      quantity: "",
      open: "",
      close: "",
      status: "open",
    },
    validate: {
      symbol: isNotEmpty("กรุณาเลือกสินทรัพย์"),
      quantity: (value) =>
        value
          ? value <= 0
            ? "จำนวนสินทรัพย์ต้องมากกว่า 0 บาท"
            : null
          : "กรุณาระบุจำนวนสินทรัพย์",
      open: (value) =>
        value
          ? value <= 0
            ? "ราคาเปิดต้องมากกว่า 0 บาท"
            : null
          : "กรุณาระบุราคาเปิด",
      close: (value) => {
        if (isShowCloseInput) {
          return value
            ? value <= 0
              ? "ราคาปิดต้องมากกว่า 0 บาท"
              : null
            : "กรุณาระบุราคาปิด";
        }
        return null;
      },
    },
  });

  form.watch("status", ({ value }) => {
    setIsShowCloseInput(value === "closed");
  });

  React.useEffect(() => {
    refetch();
  }, [assetType, refetch]);

  const handleAssetTypeChange = (value) => {
    setAssetType(value);
    form.setFieldValue("symbol", "");
  };

  const handleCreateOrder = async (data) => {
    const isValid = symbols.includes(data.symbol);
    if (!isValid) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่พบสินทรัพย์ดังกล่าว",
        color: "red",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrder({ data: { ...data, assetType } });
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "สร้าง Order ไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "สร้าง Order สำเร็จ",
          color: "green",
        });
        await close();
        await form.reset();
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: response?.message || "สร้าง Order ไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
      close();
      form.reset();
    }
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleCreateOrder)} className="space-y-6">
        <Select
          withAsterisk
          allowDeselect={false}
          label="เลือกชนิดสินทรัพย์"
          data={[
            { value: "crypto", label: "Crypto" },
            { value: "stock", label: "Stock" },
          ]}
          value={assetType}
          onChange={handleAssetTypeChange}
        />
        <Autocomplete
          withAsterisk
          variant="filled"
          size="md"
          radius="md"
          placeholder="เลือกสินทรัพย์"
          data={symbols}
          key={form.key("symbol")}
          rightSection={IsLoadingSymbols ? <Loader size="1rem" /> : null}
          {...form.getInputProps("symbol")}
          filter={symbolsFilter}
        />
        <TextInput
          withAsterisk
          step="any"
          type="number"
          variant="filled"
          size="md"
          radius="md"
          placeholder="จำนวนสินทรัพย์"
          key={form.key("quantity")}
          {...form.getInputProps("quantity")}
        />
        <Select
          allowDeselect={false}
          withAsterisk
          label="เลือกสถานะ"
          data={[
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
          ]}
          key={form.key("status")}
          {...form.getInputProps("status")}
        />
        <TextInput
          withAsterisk
          step="any"
          type="number"
          variant="filled"
          size="md"
          radius="md"
          placeholder="ราคาเปิด"
          key={form.key("open")}
          {...form.getInputProps("open")}
        />
        {isShowCloseInput && (
          <TextInput
            withAsterisk
            step="any"
            type="number"
            variant="filled"
            size="md"
            radius="md"
            placeholder="ราคาปิด"
            key={form.key("close")}
            {...form.getInputProps("close")}
          />
        )}
        <div className="flex justify-end">
          <Button
            loading={isSubmitting}
            className="bg-primary"
            type="submit"
            variant="outline"
            size="sm"
            radius="md"
          >
            เพิ่มรายการ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
