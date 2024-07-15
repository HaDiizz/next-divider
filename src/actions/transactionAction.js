"use server";
import connectDB from "@/lib/connectDB";
import Transaction from "@/models/transactionModel";
import User from "@/models/userModel";
import Account from "@/models/accountModel";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import strCurrentMonthYear from "@/utils/strCurrentMonthYear";

export async function createTransaction(data) {
  try {
    const { name, category, type, amount, date, remark, accountId } = data;
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    if (!name || !category || !type || !amount || !date) {
      throw { message: "กรุณากรอกข้อมูล" };
    }
    if (!accountId) throw { message: "ไม่พบข้อมูลบัญชี" };
    await connectDB();
    const validAccount = await Account.findOne({
      _id: accountId,
      $or: [
        { owner: session.user._id },
        { members: { $in: [session.user._id] } },
      ],
    });
    if (!validAccount) throw { message: "ไม่พบเจอข้อมูลบัญชีดังกล่าว" };
    const newTransaction = new Transaction({
      name,
      date,
      type,
      category,
      amount: Number(amount),
      remark,
      user: session.user._id,
      account: accountId,
    });
    await newTransaction.save();
    validAccount.transactions.push(newTransaction._id);
    await validAccount.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    revalidatePath(`/account/${accountId}`);
    return { success: true, message: "สร้างรายการสำเร็จ" };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "สร้างรายการไม่สำเร็จ" };
  }
}

export async function getTransactions(accountId, date = strCurrentMonthYear()) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const validAccount = await Account.findOne({
      _id: accountId,
      $or: [
        { owner: session.user._id },
        { members: { $in: [session.user._id] } },
      ],
    }).populate({
      path: "owner",
      model: User,
      select: "username",
    });
    if (!validAccount) throw { message: "ไม่พบเจอข้อมูลบัญชีดังกล่าว" };
    const [year, month] = date?.split("-")?.map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let transactions = await Transaction.find({
      account: validAccount._id,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "user",
        model: User,
        select: "username",
      })
      .lean();
    transactions = transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      account: transaction.account.toString(),
      user: {
        _id: transaction.user._id.toString(),
        username: transaction.user.username,
      },
    }));
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const monthlyTotalAmount = totalIncome - totalExpense;

    let allTransactions = await Transaction.find({
      account: validAccount._id,
    }).lean();
    const overallTotalAmount = allTransactions.reduce((sum, transaction) => {
      if (transaction.type === "income") {
        return sum + transaction.amount;
      } else if (transaction.type === "expense") {
        return sum - transaction.amount;
      }
      return sum;
    }, 0);
    return {
      success: true,
      transactions,
      overallTotalAmount,
      monthlyTotalAmount,
      totalIncome,
      totalExpense,
      account: {
        name: validAccount.name,
        members: validAccount.members.length,
        owner: {
          _id: validAccount.owner._id.toString(),
          username: validAccount.owner.username,
        },
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

export async function deleteTransaction(transactionId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw { message: "ไม่เจอรายการดังกล่าว" };
    const accountId = transaction.account;

    await Transaction.findByIdAndDelete(transactionId);

    await Account.findByIdAndUpdate(accountId, {
      $pull: { transactions: transactionId },
    });
    revalidatePath(`/account/${accountId}`);
    return {
      success: true,
      message: "ลบรายการสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}
