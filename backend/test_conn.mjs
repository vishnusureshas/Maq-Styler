const uri = 'mongodb+srv://vishnuasuresh2000_db_user:i1tOCKhMI2znBiSr@cluster0.u8mx1hq.mongodb.net/?appName=Cluster0';

const { default: mongoose } = await import('mongoose');

try {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log('CONNECTED OK');
  console.log('host:', conn.connection.host);
  console.log('name:', conn.connection.name);
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('collections:', collections.map((c) => c.name).join(', ') || '(none)');
  process.exit(0);
} catch (e) {
  const stack = e.stack || e.message;
  const authMatch = stack.match(/Authentication failed[^\n]*|not authorized[^\n]*/i);
  const netMatch = stack.match(/Could not connect[^\n]*/);
  const srvMatch = stack.match(/getaddrinfo[^\n]*|query[^\n]*Srv[^\n]*|ENOTFOUND[^\n]*/i);
  console.log('CONNECTION FAILED');
  console.log('AUTH-related?', authMatch ? authMatch[0] : 'no');
  console.log('NETWORK-related?', netMatch ? netMatch[0] : 'no');
  console.log('DNS/SRV-related?', srvMatch ? srvMatch[0] : 'no');
  console.log('first line:', (e.message || '').split('\n')[0]);
  process.exit(1);
}