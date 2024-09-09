"use client";
import AuthProvider from "./AuthProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

export default function Providers({ children, session }) {
  return (
    <AuthProvider session={session}>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider
        theme={{
          cursorType: "pointer",
          colors: {
            dark: [
              "#d5d7e0",
              "#acaebf",
              "#8c8fa3",
              "#666980",
              "#4d4f66",
              "#161f3d",
              "#161f3d",
              "#161f3d",
              "#161f3d",
              "#161f3d",
            ],
          },
        }}
        defaultColorScheme="light"
      >
        <ModalsProvider>
          <ReactQueryProvider> {children}</ReactQueryProvider>
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
