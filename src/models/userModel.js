import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    sharedAccounts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "accounts",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.users || mongoose.model("users", userSchema);
