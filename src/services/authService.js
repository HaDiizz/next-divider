import connectDB from "@/lib/connectDB";
import bcrypt from "bcrypt";
import User from "@/models/userModel";

export const signIn = async (request) => {
  try {
    const { username, password } = request;
    await connectDB();
    if (!username || !password) throw { message: "กรุณากรอกข้อมูล" };
    let validUser = await User.findOne({ username });
    if (!validUser) throw { message: "ไม่เจอบัญชีผู้ใช้งาน" };
    let isPasswordMatch = await bcrypt.compare(password, validUser.password);

    if (!isPasswordMatch) throw { message: "ชื่อผู้ใช้งาน/รหัสผ่านไม่ถูกต้อง" };
    validUser = validUser.toObject();
    validUser._id = validUser._id.toString();
    delete validUser.password;
    return {
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: { user: validUser },
    };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "เกิดข้อผิดพลาด" };
  }
};
