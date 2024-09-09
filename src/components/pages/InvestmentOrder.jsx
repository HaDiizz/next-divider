"use client";

import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CreateOrderModal from "../CreateOrderModal";

const InvestmentOrder = () => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <div className="flex flex-col items-end gap-y-5">
      <Button className="bg-primary" onClick={() => open()}>
        เพิ่ม Order
      </Button>
      <CreateOrderModal opened={opened} close={close} />
    </div>
  );
};

export default InvestmentOrder;
