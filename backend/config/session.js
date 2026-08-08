import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { redisClient, waitForRedisReady } from './redis.js';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

const ready = REDIS_ENABLED ? await waitForRedisReady(4000) : false;

if (ready) {
  console.log('Using Redis session store');
} else {
  console.warn('Redis unavailable — falling back to in-memory session store');
}

const makeSession = () => {
  const store = ready
    ? new RedisStore({ client: redisClient, ttl: SESSION_TTL, prefix: 'session:' })
    : new session.MemoryStore();

  return session({
    store,
    name: 'sid',
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_TTL * 1000,
    },
  });
};

export default makeSession;