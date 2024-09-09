import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    averageBuyPrice: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 },
    isFixed: { type: Boolean, required: true },
    assetType: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.assets || mongoose.model("assets", assetSchema);
