"use client";
import AuthProvider from "./AuthProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import { MantineProvider } from "@mantine/core";

export default function Providers({ children, session }) {
  return (
    <AuthProvider session={session}>
      <MantineProvider>
        <ReactQueryProvider> {children}</ReactQueryProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
