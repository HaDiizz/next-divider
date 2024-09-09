"use client";

import { Modal } from "@mantine/core";
import AssetForm from "./AssetForm";

const CreateAssetModal = ({ opened, close }) => {
  return (
    <Modal.Root opened={opened} onClose={close} centered>
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>เพิ่มสินทรัพย์</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <AssetForm close={close} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default CreateAssetModal;
