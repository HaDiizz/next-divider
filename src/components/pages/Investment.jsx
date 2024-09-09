"use client";
import { useState } from "react";
import { refreshSecretKey } from "@/actions/authAction";
import { ActionIcon, Badge, Button, CopyButton, Tooltip } from "@mantine/core";
import { CheckIcon, CopyIcon, ReloadIcon } from "@radix-ui/react-icons";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { nprogress } from "@mantine/nprogress";
import { useDisclosure } from "@mantine/hooks";
import CreateAssetModal from "../CreateAssetModal";

const Investment = ({ secretKey }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const handleRefreshSecretKey = async () => {
    setIsPending(true);
    try {
      const response = await refreshSecretKey();
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "สร้างคีย์ไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "สร้างคีย์สำเร็จ",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: response?.message || "สร้างคีย์ไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsPending(false);
    }
  };
  return (
    <div className="flex flex-col items-end gap-y-5">
      <div className="flex justify-center gap-x-2">
        <Button
          className="bg-primary"
          variant="light"
          onClick={() => {
            nprogress.start();
            router.push("/investment/order");
          }}
        >
          รายการ Order
        </Button>
        <Button className="bg-primary" onClick={() => open()}>
          เพิ่มสินทรัพย์
        </Button>
      </div>
      <div className="flex justify-center items-center gap-x-2">
        <div className="flex justify-center gap-x-2">
          <span className="text-sm uppercase font-bold text-neutral-500">
            Secret Key :
          </span>
          <Badge variant="light" color="#f24391">
            {secretKey.slice(0, 23) + "..." || "-"}
          </Badge>
        </div>
        <CopyButton value={secretKey || ""} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              withArrow
              position="bottom"
            >
              <ActionIcon
                color={copied ? "teal" : "gray"}
                variant="subtle"
                onClick={copy}
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
        <Tooltip label="Refresh" withArrow position="bottom">
          <ActionIcon
            disabled={isPending}
            variant="subtle"
            onClick={handleRefreshSecretKey}
          >
            <ReloadIcon className="w-4 h-4" />
          </ActionIcon>
        </Tooltip>
      </div>
      <CreateAssetModal opened={opened} close={close} />
    </div>
  );
};

export default Investment;
