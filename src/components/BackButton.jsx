"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { nprogress } from "@mantine/nprogress";

const BackButton = () => {
  const router = useRouter();
  return (
    <div>
      <Button
        size="sm"
        radius="md"
        className="bg-primary"
        variant="light"
        onClick={() => {
          nprogress.start();
          router.back();
        }}
      >
        ย้อนกลับ
      </Button>
    </div>
  );
};

export default BackButton;
