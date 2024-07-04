import mongoose from "mongoose";

const configOptions = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
};

const connectDB = async () => {
  const connectionUrl = process.env.MONGODB_URI;

  mongoose
    .connect(connectionUrl, configOptions)
    .then(() => console.log("Connected successfully!"))
    .catch((err) =>
      console.log(`Getting Error from DB connection ${err.message}`)
    );
};

export default connectDB;
