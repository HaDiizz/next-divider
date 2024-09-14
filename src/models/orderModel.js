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
      enum: ["open", "closed"],
      default: "open",
    },
    // profitLoss: {
    //   type: Number,
    //   default: 0,
    // },
    user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

// orderSchema.pre("save", function (next) {
//   if (this.isModified("status") || this.isModified("close")) {
//     if (this.status === "closed" && this.close !== undefined) {
//       this.profitLoss = (this.close - this.open) * this.quantity;
//     } else {
//       this.profitLoss = 0;
//     }
//   }
//   next();
// });

export default mongoose.models.orders || mongoose.model("orders", orderSchema);
