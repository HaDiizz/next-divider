import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Asset from "@/models/assetModel";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  try {
    const secretKey = request.headers?.get("Secret-Key");
    if (!secretKey) throw { code: 401, message: "Unauthorize" };
    await connectDB();
    let validUser = await User.findOne({
      secretKey: secretKey,
    });
    if (!validUser) throw { code: 403, message: "Forbidden" };
    validUser = validUser.toObject();
    const assets = await Asset.find({
      user: validUser._id.toString(),
      isFixed: false,
    }).select("symbol assetType timeframe").lean();

    return NextResponse.json({ status: 200, assets });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: err.code || 500 }
    );
  }
};
