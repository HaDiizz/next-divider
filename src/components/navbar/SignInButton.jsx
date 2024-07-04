"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";

const SignInButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/sign-in")}
      className="bg-primary"
      variant="filled"
      size="sm"
      radius="md"
    >
      เข้าสู่ระบบ
    </Button>
  );
};

export default SignInButton;
