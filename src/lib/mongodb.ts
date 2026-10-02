import mongoose from "mongoose";
import { readConfig, requireConfig } from "@/lib/config";

let connection: Promise<typeof mongoose> | undefined;

export function connectMongoDB(): Promise<typeof mongoose> {
  if (!connection) {
    const uri = requireConfig(readConfig(), "MONGODB_URI");
    connection = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch((error: unknown) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

export function mongoReady(): boolean { return mongoose.connection.readyState === 1; }
