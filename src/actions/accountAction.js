"use server";
import connectDB from "@/lib/connectDB";
import Account from "@/models/accountModel";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function createAccount(data) {
  const { name } = data;

  try {
    if (!name) {
      throw { message: "กรุณากรอกข้อมูล" };
    }
    await connectDB();
    const newAccount = new Account({
      name,
    });
    await newAccount.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "สร้างบัญชีออมสำเร็จ" };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "สร้างบัญชีออมไม่สำเร็จ" };
  }
}

export async function getAccounts() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}
