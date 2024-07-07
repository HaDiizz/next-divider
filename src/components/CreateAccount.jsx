"use client";
import React from "react";
import { Button, Modal, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createAccount } from "@/actions/accountAction";
import { notifications } from "@mantine/notifications";

const CreateAccount = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
    },
    validate: {
      name: isNotEmpty("กรุณากรอกชื่อบัญชีออมเงิน/กลุ่มของคุณ"),
    },
  });

  const handleCreateAccount = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await createAccount(data);
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "สร้างบัญชีออมไม่สำเร็จ",
          color: "red",
        });
      } else {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "สร้างบัญชีออมสำเร็จ",
          color: "green",
        });
        await close();
        await form.reset();
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: response?.message || "สร้างบัญชีออมไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
      close();
      form.reset();
    }
  };
  return (
    <>
      <Modal.Root
        opened={opened}
        onClose={() => {
          form.reset();
          close();
        }}
        centered
      >
        <Modal.Overlay backgroundOpacity={0.55} blur={3} />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>สร้างบัญชีออมเงิน/กลุ่ม</Modal.Title>
            <Modal.CloseButton className="text-white hover:text-primary" />
          </Modal.Header>
          <Modal.Body className="pt-5 pb-5">
            <form
              onSubmit={form.onSubmit(handleCreateAccount)}
              className="space-y-6"
            >
              <TextInput
                withAsterisk
                variant="filled"
                size="md"
                radius="md"
                placeholder="ชื่อบัญชีออมเงิน"
                key={form.key("name")}
                {...form.getInputProps("name")}
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
                  ยืนยันสร้างบัญชี
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <div className="flex justify-end w-full">
        <Button
          variant="filled"
          size="sm"
          radius="md"
          className="bg-secondary"
          onClick={open}
        >
          สร้างบัญชีออมเงิน
        </Button>
      </div>
    </>
  );
};

export default CreateAccount;
