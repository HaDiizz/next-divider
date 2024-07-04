"use server";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import bcrypt from "bcrypt";

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
    });
    await newUser.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "สร้างบัญชีสำเร็จ" };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "สร้างบัญชีไม่สำเร็จ" };
  }
}
