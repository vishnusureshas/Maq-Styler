import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let client = null;
let enabled = false;
let lastError = null;

const getClient = () => {
  if (client) return client;

  if (!REDIS_ENABLED) {
    enabled = false;
    return null;
  }

  client = new Redis(REDIS_URL, {
    connectTimeout: 5000,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });

  client.on('connect', () => {
    enabled = true;
    lastError = null;
    console.log('Redis connected');
  });

  client.on('error', (err) => {
    enabled = false;
    lastError = err.message;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Redis error (caching disabled): ${err.message}`);
    }
  });

  client.on('close', () => {
    enabled = false;
  });

  return client;
};

export const redisClient = getClient();

export const isRedisUp = () => enabled || client?.status === 'ready';

export const waitForRedisReady = (timeoutMs = 4000) =>
  new Promise((resolve) => {
    if (isRedisUp()) return resolve(true);
    const onReady = () => {
      cleanup();
      resolve(true);
    };
    const onFail = () => {
      cleanup();
      resolve(false);
    };
    const timer = setTimeout(onFail, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      client?.off('ready', onReady);
      client?.off('end', onFail);
    };
    client?.on('ready', onReady);
    client?.on('end', onFail);
  });

export const redisGet = async (key) => {
  if (!isRedisUp()) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`Redis get failed for ${key}: ${err.message}`);
    return null;
  }
};

export const redisSet = async (key, value, ttlSeconds = 300) => {
  if (!isRedisUp()) return false;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.warn(`Redis set failed for ${key}: ${err.message}`);
    return false;
  }
};

export const redisDel = async (...keys) => {
  if (!isRedisUp()) return;
  try {
    if (client.del) await client.del(...keys);
  } catch (err) {
    console.warn(`Redis del failed: ${err.message}`);
  }
};

export const redisDelPattern = async (pattern) => {
  if (!isRedisUp()) return;
  try {
    const stream = client.scanStream({ match: pattern, count: 100 });
    const pipeline = client.pipeline();
    stream.on('data', (keys) => {
      if (keys.length) keys.forEach((k) => pipeline.del(k));
    });
    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    await pipeline.exec();
  } catch (err) {
    console.warn(`Redis pattern del failed for ${pattern}: ${err.message}`);
  }
};

export default client;