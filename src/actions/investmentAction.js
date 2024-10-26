"use server";
import connectDB from "@/lib/connectDB";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import Asset from "@/models/assetModel";
import Order from "@/models/orderModel";
import { getRefreshToken } from "./authAction";

export async function createAsset({ data }) {
  try {
    const { symbol, isFixed, assetType } = data;
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    if (!symbol) {
      throw { message: "กรุณากรอกข้อมูล" };
    }
    await connectDB();
    const validAsset = await Asset.findOne({
      user: session.user._id,
      symbol: symbol,
    });
    if (validAsset) throw { message: "คุณมีสินทรัพย์นี้อยู่แล้ว" };
    const newAsset = new Asset({
      user: session.user._id,
      symbol,
      quantity: 0,
      averageBuyPrice: 0,
      totalValue: 0,
      profitLoss: 0,
      isFixed,
      assetType,
    });
    await newAsset.save();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    revalidatePath(`/investment`);
    return { success: true, message: "เพิ่มสินทรัพย์สำเร็จ" };
  } catch (err) {
    console.log(err);
    return { error: true, message: err?.message || "เพิ่มสินทรัพย์ไม่สำเร็จ" };
  }
}

export async function getAssets() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }

    await connectDB();

    const assets = await Asset.find({
      user: session.user._id,
    }).lean();

    for (let asset of assets) {
      asset._id = asset._id.toString();
      asset.user = asset.user.toString();

      const orders = await Order.find({
        user: session.user._id,
        symbol: asset.symbol,
        assetType: asset.assetType,
      }).lean();

      let totalQuantity = 0;
      let totalBuyValue = 0;

      for (let order of orders) {
        totalQuantity += order.quantity;
        totalBuyValue += order.quantity * order.open;
      }

      asset.quantity = totalQuantity;
      asset.averageBuyPrice =
        totalQuantity > 0 ? totalBuyValue / totalQuantity : 0;

      await Asset.updateOne(
        { _id: asset._id },
        {
          quantity: asset.quantity,
          averageBuyPrice: asset.averageBuyPrice,
        }
      );
    }

    return {
      success: true,
      assets,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function deleteAsset(assetId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const asset = await Asset.findOne({ _id: assetId, user: session.user._id });
    if (!asset) throw { message: "ไม่เจอสินทรัพย์ดังกล่าว" };

    await Asset.findByIdAndDelete(assetId);

    revalidatePath(`/investment`);
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

export async function updateFixedAsset(assetId, isFixed) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const asset = await Asset.findOne({ _id: assetId, user: session.user._id });
    if (!asset) throw { message: "ไม่เจอสินทรัพย์ดังกล่าว" };

    await Asset.findOneAndUpdate(
      { _id: assetId, user: session.user._id },
      { isFixed: isFixed }
    );

    revalidatePath(`/investment`);
    return {
      success: true,
      message: "เปลี่ยนสำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function getSymbols(assetType) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();

    const symbols = await Asset.find({
      user: session.user._id,
      assetType,
    })
      .select("symbol")
      .lean();

    for (let symbol of symbols) {
      symbol._id = symbol._id.toString();
    }

    return symbols?.length > 0 ? symbols.map((symbol) => symbol.symbol) : [];
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function getOrders() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();

    const orders = await Order.find({
      user: session.user._id,
    }).lean();

    for (let order of orders) {
      order._id = order._id.toString();
      order.user = order.user.toString();
    }

    return {
      success: true,
      orders,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function createOrder({ data }) {
  try {
    const { assetType, symbol, quantity, open, status, type } = data;
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    if (
      type === "" ||
      assetType === "" ||
      symbol === "" ||
      quantity === "" ||
      open === "" ||
      status === "" ||
      !assetType ||
      !symbol ||
      !quantity ||
      !open ||
      !status
    )
      throw { message: "กรุณากรอกข้อมูลให้ครบถ้วน" };

    await connectDB();
    const { key } = await getRefreshToken();
    const response = await fetch(
      process.env.BASE_URL
        ? `${process.env.BASE_URL}/api/order`
        : `http://localhost:3000/api/order`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Secret-Key": key,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    if (result.status !== 200)
      throw {
        message: result.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      };

    revalidatePath("/investment/order");
    return {
      success: true,
      message: "สร้าง Order สำเร็จ",
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function deleteOrder(id) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw { message: "กรุณาเข้าสู่ระบบ" };
    }
    await connectDB();
    const order = await Order.findOne({ _id: id, user: session.user._id });
    if (!order) throw { message: "ไม่เจอสินทรัพย์ดังกล่าว" };

    await Order.findByIdAndDelete(id);

    revalidatePath(`/investment/order`);
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
