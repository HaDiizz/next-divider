import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enums: ["income", "expense"],
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    remark: {
      type: String,
      default: "",
    },
    user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    account: { type: mongoose.Types.ObjectId, ref: "accounts", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.transactions ||
  mongoose.model("transactions", transactionSchema);
