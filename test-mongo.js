// test-mongo.mjs
import mongoose from "mongoose";

const uri = "mongodb+srv://madhavofficial0608:Test123123123@cluster0.d4jaiwo.mongodb.net/schemeFinder?authSource=admin&authMechanism=SCRAM-SHA-256&retryWrites=true&w=majority";

(async () => {
  try {
    console.log("🔍 Trying to connect...");
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected successfully to MongoDB!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err); // full error to help debug
  }
})();
