import { MongoClient, type Db } from 'mongodb';

type MongoCache = { client: MongoClient; db: Db; indexesReady: Promise<void> };
declare global { var midnightBidMongo: Promise<MongoCache> | undefined }

export async function getMongo() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured for this Vercel function.');
  globalThis.midnightBidMongo ??= (async () => {
    const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 8_000, maxPoolSize: 10 });
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'midnight_bid');
    const indexesReady = (async () => {
      const users = db.collection('users');
      try {
        const oldWalletIndex = (await users.listIndexes().toArray()).find((index) => index.name === 'walletAddress_1');
        if (oldWalletIndex && oldWalletIndex.sparse !== true) await users.dropIndex('walletAddress_1');
      } catch (error) {
        const mongoError = error as { code?: number; codeName?: string };
        if (mongoError.code !== 26 && mongoError.code !== 27 && mongoError.codeName !== 'NamespaceNotFound' && mongoError.codeName !== 'IndexNotFound') throw error;
      }
      await Promise.all([
      db.collection('authChallenges').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      users.createIndex({ walletAddress: 1 }, { unique: true, sparse: true }),
      users.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } }),
      db.collection('transactions').createIndex({ txId: 1 }, { unique: true }),
      db.collection('transactions').createIndex({ walletAddress: 1, confirmedAt: -1 }),
      db.collection('transactions').createIndex({ auctionId: 1, confirmedAt: -1 }),
      ]);
    })();
    return { client, db, indexesReady };
  })();
  const mongo = await globalThis.midnightBidMongo;
  await mongo.indexesReady;
  return mongo.db;
}
