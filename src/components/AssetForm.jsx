"use client";
import React from "react";
import { Autocomplete, Button, Checkbox, Loader, Select } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createAsset } from "@/actions/investmentAction";
import { useQuery } from "@tanstack/react-query";
import { fetchSymbols } from "@/services/assetService";

const symbolsFilter = ({ options, search }) => {
  const filtered = options.filter((option) =>
    option.label.toLowerCase().trim().includes(search.toLowerCase().trim())
  );

  filtered.sort((a, b) => a.label.localeCompare(b.label));
  return filtered;
};

const AssetForm = ({ close }) => {
  const [assetType, setAssetType] = React.useState("crypto");
  const {
    data: symbols = [],
    isLoading: IsLoadingSymbols,
    refetch,
  } = useQuery({
    queryFn: async () => await fetchSymbols(assetType),
    queryKey: ["symbols"],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      symbol: "",
      isFixed: true,
    },
    validate: {
      symbol: isNotEmpty("กรุณาเลือกสินทรัพย์"),
    },
  });

  React.useEffect(() => {
    refetch();
  }, [assetType, refetch]);

  const handleAssetTypeChange = (value) => {
    setAssetType(value);
    form.setFieldValue("symbol", "");
  };

  const handleCreateAsset = async (data) => {
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
      const response = await createAsset({ data: { ...data, assetType } });
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "เพิ่มสินทรัพย์ไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "เพิ่มสินทรัพย์สำเร็จ",
          color: "green",
        });
        await close();
        await form.reset();
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: response?.message || "เพิ่มสินทรัพย์ไม่สำเร็จ",
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
      <form onSubmit={form.onSubmit(handleCreateAsset)} className="space-y-6">
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
        <Checkbox
          key={form.key("isFixed")}
          {...form.getInputProps("isFixed", { type: "checkbox" })}
          label="Fix this asset (Do not allow bot to trade)"
        />
        <div className="flex justify-end">
          <Button
            loading={isSubmitting}
            className="bg-primary"
            type="submit"
            variant="outline"
            size="sm"
            radius="md"
          >
            เพิ่มสินทรัพย์
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
