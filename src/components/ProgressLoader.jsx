"use client";
import { useEffect } from "react";
import { nprogress } from "@mantine/nprogress";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const ProgressLoader = () => {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    nprogress.complete();
  }, [pathname, router]);
};

export default ProgressLoader;
