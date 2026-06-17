import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

console.log(uri);

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("CONNECTED");

  console.log("MONGODB URI:", process.env.MONGODB_URI)
} catch (e) {
  console.error(e);
}