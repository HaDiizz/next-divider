"use client";

import { Modal } from "@mantine/core";
import OrderForm from "./OrderForm";

const CreateOrderModal = ({ opened, close }) => {
  return (
    <Modal.Root opened={opened} onClose={close} centered>
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>เพิ่ม Order</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <OrderForm close={close} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default CreateOrderModal;
