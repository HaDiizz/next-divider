import connectDB from "@/lib/connectDB";
import Account from "@/models/accountModel";
import Transaction from "@/models/transactionModel";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import User from "@/models/userModel";
import Order from "@/models/orderModel";
import Asset from "@/models/assetModel";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  try {
    const secretKey = request.headers?.get("Secret-Key");
    const form = await request.json();

    await connectDB();
    let validUser = await User.findOne({
      secretKey: secretKey,
    });
    if (!validUser) throw { code: 403, message: "Forbidden" };
    validUser = validUser.toObject();
    const isAssetExist = await Asset.findOne({ symbol: form.symbol });
    if (!isAssetExist) throw { code: 400, message: "Asset does not exist." };
    if (
      !form.symbol ||
      !form.assetType ||
      !form.quantity ||
      !form.open ||
      !validUser._id.toString()
    )
      throw { code: 400, message: "Field are required." };
    const newOrder = new Order({
      ...form,
      user: validUser._id.toString(),
    });

    await newOrder.save();

    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: err.code || 500 }
    );
  }
};
