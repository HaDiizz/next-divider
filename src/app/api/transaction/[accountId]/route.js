import connectDB from "@/lib/connectDB";
import Account from "@/models/accountModel";
import Transaction from "@/models/transactionModel";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export const dynamic = "force-dynamic";

export const POST = async (_, context) => {
  const { accountId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { code: 401, message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const validAccount = await Account.findOne({
      _id: accountId,
      $or: [
        { owner: session.user._id },
        { members: { $in: [session.user._id] } },
      ],
    });
    if (!validAccount)
      throw { code: 404, message: "ไม่พบเจอข้อมูลบัญชีดังกล่าว" };
    let transactions = await Transaction.find({
      account: validAccount._id,
    }).lean();
    transactions = transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      user: transaction.user.toString(),
      account: transaction.account.toString(),
    }));
    const totalAmount = transactions.reduce((sum, transaction) => {
      if (transaction.type === "income") {
        return sum + transaction.amount;
      } else if (transaction.type === "expense") {
        return sum - transaction.amount;
      }
      return sum;
    }, 0);
    return NextResponse.json({ transactions, totalAmount });
  } catch (err) {
    console.log(err);
    NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: err.code || 500 }
    );
  }
};
