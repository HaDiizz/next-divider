"use client";
import React from "react";
import {
  Button,
  TextInput,
  PasswordInput,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { signUpAction } from "@/actions/authAction";

const SignUpForm = () => {
  const { colorScheme } = useMantineColorScheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
      cf_password: "",
    },
    validate: {
      username: isNotEmpty("กรุณากรอกชื่อผู้ใช้งาน"),
      password: isNotEmpty("กรุณากรอกรหัสผ่าน"),
      cf_password: (value, values) =>
        value === ""
          ? "กรุณากรอกยืนยันรหัสผ่าน"
          : value !== values.password
          ? "รหัสผ่านไม่ตรงกัน"
          : null,
    },
  });

  const handleSignUp = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await signUpAction({
        username: data.username,
        password: data.password,
        cf_password: data.cf_password,
      });
      if (response?.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "สร้างบัญชีไม่สำเร็จ",
          color: "red",
        });
        return;
      }
      if (response?.success) {
        notifications.show({
          title: "สำเร็จ",
          message: response?.message || "สร้างบัญชีสำเร็จ",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "สร้างบัญชีไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  return (
    <div className="shadow-md border-2 border-opacity-70 border-secondary rounded-lg w-full md:w-8/12 lg:w-5/12 xl:w-5/12 p-8">
      <form onSubmit={form.onSubmit(handleSignUp)} className="space-y-6">
        <div className="flex gap-x-1 text-xl">
          <span>สร้างบัญชี</span>
        </div>
        <TextInput
          withAsterisk
          variant="filled"
          size="md"
          radius="md"
          placeholder="ชื่อผู้ใช้งาน"
          key={form.key("username")}
          {...form.getInputProps("username")}
        />
        <PasswordInput
          withAsterisk
          variant="filled"
          size="md"
          radius="md"
          placeholder="รหัสผ่าน"
          key={form.key("password")}
          {...form.getInputProps("password")}
        />
        <PasswordInput
          withAsterisk
          variant="filled"
          size="md"
          radius="md"
          placeholder="ยืนยันรหัสผ่าน"
          key={form.key("cf_password")}
          {...form.getInputProps("cf_password")}
        />
        <span className="flex justify-end">
          <Link
            className={`${
              colorScheme === "dark" ? "text-secondary" : "text-primary"
            } pl-2`}
            href={"/sign-in"}
          >
            ลงชื่อเข้าใช้งาน
          </Link>
        </span>
        <Button
          loading={isSubmitting}
          type="submit"
          className="bg-primary"
          variant="filled"
          size="sm"
          radius="md"
        >
          สร้างบัญชี
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;
