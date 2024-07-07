import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    transactions: [{ type: mongoose.Types.ObjectId, ref: "transactions" }],
    members: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    owner: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.accounts ||
  mongoose.model("accounts", accountSchema);
