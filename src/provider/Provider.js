"use client";
import AuthProvider from "./AuthProvider";
import { MantineProvider } from "@mantine/core";

export default function Providers({ children, session }) {
  return (
    <AuthProvider session={session}>
      <MantineProvider>{children}</MantineProvider>
    </AuthProvider>
  );
}
