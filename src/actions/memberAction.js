"use server";
import connectDB from "@/lib/connectDB";
import User from "@/models/userModel";
import Account from "@/models/accountModel";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function getMembers(accountId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    let account = await Account.findOne({
      _id: accountId,
      $or: [
        { owner: session.user._id },
        { members: { $in: [session.user._id] } },
      ],
    })
      .populate({
        path: "members",
        model: User,
        select: "username",
      })
      .select("-transactions");
    if (!account) throw { message: "ไม่พบเจอข้อมูลบัญชีดังกล่าว" };
    account = account.toObject();
    account._id = account._id.toString();
    account.owner = account.owner.toString();
    if (account?.members.length > 0) {
      account.members.map((member) => member._id.toString());
    }
    return {
      success: true,
      account: {
        members: account.members,
        owner: account.owner,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function removeMemberFromGroup({ accountId, userId }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }

    await connectDB();

    let account = await Account.findById(accountId);
    let user = await User.findById(session.user._id);

    if (!account) {
      throw { message: "ไม่เจอบัญชีดังกล่าว" };
    }

    if (!user) {
      throw { message: "ไม่เจอข้อมูลผู้ใช้ในระบบ" };
    }

    if (account.owner.toString() !== session.user._id) {
      throw {
        message: "คุณไม่มีสิทธิ์ในการเข้าถึง",
      };
    }

    if (account.owner.toString() === userId) {
      throw {
        message: "ไม่สามารถออกจากกลุ่มได้ เนื่องจากคุณเป็นเจ้าของกลุ่มบัญชี",
      };
    }
    if (!account.members.some((memberId) => memberId.toString() === userId)) {
      throw {
        message:
          "ไม่สามารถออกจากกลุ่มได้ เนื่องจากผู้ใช้ไม่ได้อยู่ในรายชื่อกลุ่มบัญชีนี้",
      };
    }
    await Account.findByIdAndUpdate(accountId, {
      $pull: { members: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { sharedAccounts: accountId },
    });

    return {
      success: true,
      message: "นำออกจากกลุ่มสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}
