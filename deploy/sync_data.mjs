import { MongoClient } from 'mongodb';

// Sync the `ecommerce` database from SRC to DST.
// For EC2 deploy: SRC = Atlas URI, DST = local mongo container.
// Run inside the backend container (has the mongodb driver):
//   docker cp scripts/sync_data.mjs ecommerce-backend:/app/sync_data.mjs
//   docker exec -w /app ecommerce-backend node sync_data.mjs
const SRC =
  process.env.SYNC_SRC || 'mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/ecommerce';
const DST = process.env.SYNC_DST || 'mongodb://mongo:27017/ecommerce?directConnection=true';

const client = new MongoClient(SRC, { serverSelectionTimeoutMS: 15000 });
const dstClient = new MongoClient(DST, { serverSelectionTimeoutMS: 15000 });

await client.connect();
console.log('connected to source');
await dstClient.connect();
console.log('connected to target');

const srcDB = client.db('ecommerce');
const dstDB = dstClient.db('ecommerce');
const collections = await srcDB.listCollections().toArray();

for (const { name } of collections) {
  const docs = await srcDB.collection(name).find({}).toArray();
  await dstDB.collection(name).drop().catch(() => {});
  if (docs.length) await dstDB.collection(name).insertMany(docs);
  console.log(`synced ${name}: ${docs.length} docs`);
}

const summary = {};
for (const { name } of collections) {
  summary[name] = await dstDB.collection(name).countDocuments();
}
console.log('TARGET COUNTS:', JSON.stringify(summary, null, 2));

await client.close();
await dstClient.close();
console.log('done');