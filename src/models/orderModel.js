import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: "",
    },
    symbol: {
      type: String,
      required: true,
    },
    assetType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    open: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
    },
    status: {
      type: String,
      enums: ["open", "closed"],
      default: "open",
    },
    user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.orders || mongoose.model("orders", orderSchema);
