"use client";
import React from "react";
import {
  ActionIcon,
  Autocomplete,
  Button,
  Modal,
  Select,
  TextInput,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DateInput } from "@mantine/dates";
import { createTransaction } from "@/actions/transactionAction";
import CloseMicroPhone from "./icons/CloseMicroPhone";
import OpenMicroPhone from "./icons/OpenMicroPhone";

const CreateTransaction = ({ accountId, refetch }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isOpenMicTransactionName, setIsOpenMicTransactionName] =
    React.useState(false);
  const [isOpenMicRemark, setIsOpenMicRemark] = React.useState(false);
  const [isOpenMicCategory, setIsOpenMicCategory] = React.useState(false);
  const [recognition, setRecognition] = React.useState(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "th-TH";
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        if (isOpenMicTransactionName) {
          form.setFieldValue("name", currentTranscript);
        } else if (isOpenMicRemark) {
          form.setFieldValue("remark", currentTranscript);
        } else if (isOpenMicCategory) {
          form.setFieldValue("category", currentTranscript);
        }
      };

      recognitionInstance.onend = () => {
        if (isOpenMicTransactionName || isOpenMicRemark || isOpenMicCategory) {
          recognitionInstance.start();
        } else {
          recognitionInstance.stop();
        }
      };

      setRecognition(recognitionInstance);
    }
  }, []);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      date: (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      })(),
      type: "",
      category: "",
      amount: "",
      remark: "",
    },
    validate: {
      name: isNotEmpty("กรุณากรอกชื่อรายการของคุณ"),
      date: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value
          ? value.getTime() > today.getTime()
            ? "กรุณาเลือกวันที่ไม่เกินวันนี้"
            : null
          : "กรุณาเลือกวันที่";
      },
      type: isNotEmpty("กรุณากรอกประเภทของรายการ"),
      category: isNotEmpty("กรุณากรอกหมวดหมู่ของรายการ"),
      amount: (value) =>
        value
          ? value < 1
            ? "จำนวนค่าใช้จ่าย/รายได้ ต้องมากกว่า 0 บาท"
            : null
          : "กรุณากรอกค่าใช้จ่าย/รายได้",
    },
  });

  const handleCreateAccount = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await createTransaction({ ...data, accountId });
      if (response.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "สร้างรายการไม่สำเร็จ",
          color: "red",
        });
      } else {
        refetch();
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "สร้างรายการสำเร็จ",
          color: "green",
        });
        await close();
        await form.reset();
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: err?.message || "สร้างรายการไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
      close();
      form.reset();
    }
  };

  const handleOpenMic = (field) => {
    if (field === "name") {
      setIsOpenMicTransactionName(true);
      setIsOpenMicCategory(false);
      setIsOpenMicRemark(false);
    } else if (field === "remark") {
      setIsOpenMicRemark(true);
      setIsOpenMicCategory(false);
      setIsOpenMicTransactionName(false);
    } else if (field === "category") {
      setIsOpenMicCategory(true);
      setIsOpenMicRemark(false);
      setIsOpenMicTransactionName(false);
    }
    recognition.onresult = async function (event) {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(" ");
      if (field === "name") {
        form.setFieldValue("name", transcript);
      } else if (field === "remark") {
        form.setFieldValue("remark", transcript);
      } else if (field === "category") {
        form.setFieldValue("category", transcript);
      }
    };
    recognition.start();
  };

  const handleCloseMic = () => {
    setIsOpenMicTransactionName(false);
    setIsOpenMicRemark(false);
    setIsOpenMicCategory(false);
    recognition.stop();
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
            <Modal.Title>สร้างรายการใหม่</Modal.Title>
            <Modal.CloseButton className="text-white hover:text-primary" />
          </Modal.Header>
          <Modal.Body className="pt-5 pb-5">
            <form
              onSubmit={form.onSubmit(handleCreateAccount)}
              className="space-y-6"
            >
              <TextInput
                withAsterisk
                rightSection={
                  <ActionIcon
                    size="md"
                    aria-label="microphone speech to text transaction name"
                    variant="transparent"
                    disabled={isOpenMicCategory || isOpenMicRemark}
                  >
                    {!isOpenMicTransactionName ? (
                      <CloseMicroPhone
                        handleOnClick={() => handleOpenMic("name")}
                      />
                    ) : (
                      <OpenMicroPhone handleOnClick={handleCloseMic} />
                    )}
                  </ActionIcon>
                }
                variant="filled"
                size="md"
                radius="md"
                placeholder="ชื่อรายการ"
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
              <Select
                withAsterisk
                variant="filled"
                size="md"
                radius="md"
                placeholder="เลือกประเภทรายการ"
                data={[
                  { label: "รายรับ", value: "income" },
                  { label: "รายจ่าย", value: "expense" },
                ]}
                key={form.key("type")}
                {...form.getInputProps("type")}
              />
              <TextInput
                withAsterisk
                type="number"
                variant="filled"
                size="md"
                radius="md"
                placeholder="จำนวนเงิน"
                key={form.key("amount")}
                {...form.getInputProps("amount")}
              />
              <Autocomplete
                withAsterisk
                rightSection={
                  <ActionIcon
                    size="md"
                    aria-label="microphone speech to text category"
                    variant="transparent"
                    disabled={isOpenMicRemark || isOpenMicTransactionName}
                  >
                    {!isOpenMicCategory ? (
                      <CloseMicroPhone
                        handleOnClick={() => handleOpenMic("category")}
                      />
                    ) : (
                      <OpenMicroPhone handleOnClick={handleCloseMic} />
                    )}
                  </ActionIcon>
                }
                variant="filled"
                size="md"
                radius="md"
                placeholder="หมวดหมู่"
                data={[
                  "ค่าใช้จ่ายประจำปี",
                  "ค่าใช้จ่ายรายเดือน",
                  "ค่าใช้จ่ายประจำวัน",
                  "เงินเดือน",
                ]}
                key={form.key("category")}
                {...form.getInputProps("category")}
              />
              <DateInput
                withAsterisk
                variant="filled"
                size="md"
                radius="md"
                placeholder="วันที่"
                key={form.key("date")}
                {...form.getInputProps("date")}
              />
              <TextInput
                variant="filled"
                rightSection={
                  <ActionIcon
                    size="md"
                    aria-label="microphone speech to text remark"
                    variant="transparent"
                    disabled={isOpenMicCategory || isOpenMicTransactionName}
                  >
                    {!isOpenMicRemark ? (
                      <CloseMicroPhone
                        handleOnClick={() => handleOpenMic("remark")}
                      />
                    ) : (
                      <OpenMicroPhone handleOnClick={handleCloseMic} />
                    )}
                  </ActionIcon>
                }
                size="md"
                radius="md"
                placeholder="หมายเหตุเพิ่มเติม"
                key={form.key("remark")}
                {...form.getInputProps("remark")}
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
                  ยืนยันสร้างรายการ
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
          เพิ่มรายการ
        </Button>
      </div>
    </>
  );
};

export default CreateTransaction;
