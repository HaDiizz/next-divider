"use client";
import React from "react";
import { Button, TextInput, PasswordInput } from "@mantine/core";
import Link from "next/link";
import { isNotEmpty, useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

const SignInForm = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: isNotEmpty("กรุณากรอกชื่อผู้ใช้งาน"),
      password: isNotEmpty("กรุณากรอกรหัสผ่าน"),
    },
  });

  const handleSignIn = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await signIn("credentials", {
        callbackUrl: "/",
        redirect: false,
        username: data.username,
        password: data.password,
      });
      if (response?.error) {
        notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: response?.message || "ลงชื่อเข้าใช้งานไม่สำเร็จ",
          color: "red",
        });
        return;
      }
      if (response?.ok) {
        notifications.show({
          title: "ยินดีต้อนรับ",
          message: "ลงชื่อเข้าใช้งานสำเร็จ",
          color: "green",
        });
        return router.refresh();
      }
    } catch (err) {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ลงชื่อเข้าใช้งานไม่สำเร็จ",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-md border-2 border-opacity-70 border-secondary rounded-lg w-full md:w-8/12 lg:w-5/12 xl:w-5/12 p-8">
      <form onSubmit={form.onSubmit(handleSignIn)} className="space-y-6">
        <div className="flex gap-x-1 text-xl">
          <span>เข้าสู่ระบบ</span>
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
        <span className="flex justify-end">
          <Link
            className={`dark:text-secondary text-primary pl-2`}
            href={"/sign-up"}
          >
            สร้างบัญชีใหม่
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
          ลงชื่อเข้าใช้
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
