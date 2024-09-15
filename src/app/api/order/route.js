import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Order from "@/models/orderModel";
import Asset from "@/models/assetModel";

export const dynamic = "force-dynamic";

export const PUT = async (request) => {
  try {
    const secretKey = request.headers?.get("Secret-Key");
    if (!secretKey) throw { code: 401, message: "Unauthorize" };
    const form = await request.json();
    await connectDB();
    let validUser = await User.findOne({
      secretKey: secretKey,
    });
    if (!validUser) throw { code: 403, message: "Forbidden" };
    validUser = validUser.toObject();
    const isAssetExist = await Asset.findOne({
      symbol: form.symbol,
      user: validUser._id.toString(),
    });
    if (!isAssetExist) throw { code: 404, message: "Asset does not exist." };
    if (!form.symbol || !form.close || !validUser._id.toString())
      throw { code: 400, message: "Field are required." };
    if (form.close < 0)
      throw { code: 400, message: "Close price must be greater than 0." };
    await Order.findOneAndUpdate(
      { symbol: form.symbol, user: validUser._id.toString() },
      { close: form.close, status: "closed" }
    );
    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: err.code || 500 }
    );
  }
};

export const POST = async (request) => {
  try {
    const secretKey = request.headers?.get("Secret-Key");
    if (!secretKey) throw { code: 401, message: "Unauthorize" };
    const form = await request.json();
    await connectDB();
    let validUser = await User.findOne({
      secretKey: secretKey,
    });
    if (!validUser) throw { code: 403, message: "Forbidden" };
    validUser = validUser.toObject();
    const isAssetExist = await Asset.findOne({
      symbol: form.symbol,
      user: validUser._id.toString(),
    });
    if (!isAssetExist) throw { code: 404, message: "Asset does not exist." };
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
