import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Atlas SRV hostnames can fail against the machine's default DNS (corporate/
// DNS blockers), so fall back to public resolvers. For local/container mongo
// (e.g. `mongodb://mongo:27017`) we keep the platform DNS so internal
// service names like `mongo` still resolve via Docker's embedded DNS.
const uri = process.env.MONGO_URI || '';
if (uri.startsWith('mongodb+srv')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 20000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;