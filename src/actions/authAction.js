"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function signUpAction(data) {
  const { username, password, cf_password } = data;

  try {
    if (!username || !password || !cf_password) {
      throw { message: "กรุณากรอกข้อมูล" };
    }
    if (password !== cf_password) {
      throw { message: "รหัสผ่านไม่ตรงกัน" };
    }
    await connectDB();
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw { message: "ชื่อผู้ใช้งานซ้ำ กรุณาใช้ชื่ออื่น" };
    }
    let hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim(),
      password: hashPassword,
      secretKey: uuidv4(),
    });
    await newUser.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "สร้างบัญชีสำเร็จ" };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "สร้างบัญชีไม่สำเร็จ" };
  }
}

export async function refreshSecretKey() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const user = await User.findById(session.user._id);
    if (!user) {
      throw { message: "ไม่พบบัญชีผู้ใช้งาน" };
    }
    user.secretKey = uuidv4();
    await user.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    revalidatePath("/investment")
    return { success: true, message: "สร้าง Secret key สำเร็จ" };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "สร้าง Secret key ไม่สำเร็จ",
    };
  }
}

export async function getRefreshToken() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    let user = await User.findById(session.user._id);
    if (!user) {
      throw { message: "ไม่พบบัญชีผู้ใช้งาน" };
    }
    user = user.toObject();
    return {
      success: true,
      message: "ดึง Secret key สำเร็จ",
      key: user.secretKey,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "ดึง Secret key ไม่สำเร็จ",
    };
  }
}
