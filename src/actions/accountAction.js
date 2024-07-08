"use server";
import connectDB from "@/lib/connectDB";
import Account from "@/models/accountModel";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import User from "@/models/userModel";
import Transaction from "@/models/transactionModel";
import mongoose from "mongoose";

export async function createAccount(data) {
  try {
    const { name } = data;
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    if (!name) {
      throw { message: "กรุณากรอกข้อมูล" };
    }
    await connectDB();
    const validUser = await User.findById(session?.user?._id);
    if (!validUser) throw { message: "ไม่พบผู้ใช้ห" };
    const newAccount = new Account({
      name,
      owner: session.user._id,
    });
    await newAccount.save();
    await validUser.sharedAccounts.push(newAccount._id);
    await validUser.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    revalidatePath("/");
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

    let accounts = await Account.find({
      $or: [
        { owner: session.user._id },
        { members: { $in: [session.user._id] } },
      ],
    }).lean();

    for (let account of accounts) {
      const transactions = await Transaction.aggregate([
        { $match: { account: new mongoose.Types.ObjectId(account._id) } },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      let totalAmount = 0;
      transactions.forEach((transaction) => {
        if (transaction._id === "income") {
          totalAmount += transaction.totalAmount;
        } else if (transaction._id === "expense") {
          totalAmount -= transaction.totalAmount;
        }
      });

      account.totalAmount = totalAmount;
      account._id = account._id.toString();
      account.owner = account.owner.toString();
      account.transactions = account.transactions.map((id) => id.toString());
      account.members = account.members.map((id) => id.toString());
    }
    return { success: true, accounts };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function getAccount(accountId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }

    await connectDB();

    let account = await Account.findById(accountId).select(
      "name members owner"
    );
    if (!account) throw { message: "ไม่พบบัญชีดังกล่าว" };
    account = account.toObject();
    account._id = account._id.toString();
    account.owner = account.owner.toString();
    account.members = account.members.map((id) => id.toString());
    return { success: true, account };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function getInviteAccount(accountId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    let account = await Account.findById(accountId)
      .populate({
        path: "owner",
        model: User,
        select: "username",
      })
      .lean();
    if (!account) throw { message: "ไม่เจอบัญชีดังกล่าว" };
    return {
      success: true,
      account: { name: account.name, owner: account.owner.username },
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function joinAccountGroup(accountId) {
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

    if (
      account.owner.toString() === session.user._id ||
      account.members.some(
        (member) => member.toString() === session.user._id
      ) ||
      user.sharedAccounts.some(
        (sharedAccountId) =>
          sharedAccountId.toString() === account._id.toString()
      )
    ) {
      throw { message: "คุณอยู่ในกลุ่มนี้แล้ว" };
    }

    account.members.push(user._id);
    user.sharedAccounts.push(account._id);

    await account.save();
    await user.save();

    return {
      success: true,
      message: "เข้าร่วมกลุ่มสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function leaveAccountGroup(accountId) {
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

    if (account.owner.toString() === session.user._id) {
      throw {
        message: "ไม่สามารถออกจากกลุ่มได้ เนื่องจากคุณเป็นเจ้าของกลุ่มบัญชี",
      };
    }

    if (
      !account.members.some(
        (member) => member.toString() === session.user._id
      ) ||
      !user.sharedAccounts.some(
        (sharedAccountId) =>
          sharedAccountId.toString() === account._id.toString()
      )
    ) {
      throw {
        message:
          "ไม่สามารถออกจากกลุ่มได้ เนื่องจากคุณไม่ได้อยู่ในรายชื่อกลุ่มบัญชีนี้",
      };
    }
    await Account.findByIdAndUpdate(accountId, {
      $pull: { members: session.user._id },
    });
    await User.findByIdAndUpdate(session.user._id, {
      $pull: { sharedAccounts: accountId },
    });

    return {
      success: true,
      message: "ออกจากกลุ่มสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function deleteAccountGroup(accountId) {
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
        message: "ไม่สามารถลบกลุ่ม/บัญชีได้ เนื่องจากสิทธิ์การเข้าถึงไม่ผ่าน",
      };
    }
    let memberListIds = await account.members.map((member) =>
      member.toString()
    );
    memberListIds.push(account.owner.toString());
    await User.updateMany(
      { _id: { $in: memberListIds } },
      { $pull: { sharedAccounts: account._id } }
    );
    await Transaction.deleteMany({ _id: { $in: account.transactions } });
    await Account.findOneAndDelete({
      _id: account._id,
    });
    return {
      success: true,
      message: "ลบกลุ่มสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}
