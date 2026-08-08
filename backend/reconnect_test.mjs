import dns from 'dns';
const mongoose = (await import('mongoose')).default;

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://vishnuasuresh2000_db_user:i1tOCKhMI2znBiSr@cluster0.u8mx1hq.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

try {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log('CONNECTED SUCCESSFULLY!');
  console.log('host:', conn.connection.host);
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('collections:', collections.map((c) => c.name).join(', ') || '(none)');
  process.exit(0);
} catch (e) {
  console.log('STILL FAILING:', e.message.split('\n')[0]);
  process.exit(1);
}