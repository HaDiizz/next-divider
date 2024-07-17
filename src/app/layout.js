import { Kanit } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import { Notifications } from "@mantine/notifications";
import Navigation from "@/components/navbar/Navigation";
import Providers from "@/provider/Provider";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import ActionToggleMode from "@/components/ActionToggleMode";
import { SpeedInsights } from "@vercel/speed-insights/next";

const kanit = Kanit({
  subsets: ["latin"],
  variable: "--font-kanit",
  weight: "300",
});

export const metadata = {
  title: "BUN CHEE",
  description:
    "แอป BUN CHEE คือเครื่องมือที่ช่วยให้คุณบันทึกและติดตามรายรับรายจ่ายในแต่ละวันได้อย่างง่ายดาย สามารถเพิ่มบุคคลอื่นในบัญชีเพื่อใช้งานร่วมกันได้ (บัญชีร่วม) คุณสามารถดูข้อมูลและวิเคราะห์การใช้จ่ายรายเดือนได้ในที่เดียว แอปนี้ออกแบบมาเพื่อให้การจัดการการเงินส่วนบุคคลของคุณเป็นเรื่องง่ายและมีประสิทธิภาพมากยิ่งขึ้น, The BUN CHEE app is a tool that helps you easily record and track your daily income and expenses. You can add other people to share the account (joint account) and view monthly financial data and analysis in one place. This app is designed to make your personal finance management simpler and more efficient.",
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <head></head>
      <body className={kanit.className}>
        <Providers session={session}>
          <SpeedInsights />
          <Navigation />
          <Notifications />
          <main>{children}</main>
          <ActionToggleMode />
        </Providers>
      </body>
    </html>
  );
}
