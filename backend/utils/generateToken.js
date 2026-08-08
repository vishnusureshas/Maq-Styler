import jwt from 'jsonwebtoken';
import { redisSet, redisDel } from '../config/redis.js';

export const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

const REFRESH_TTL = 30 * 24 * 60 * 60; // 30d (matches JWT_REFRESH_EXPIRES_IN)

export const storeRefreshToken = async (userId, token) => {
  await redisSet(`refresh:${userId}`, token, REFRESH_TTL);
};

export const revokeRefreshToken = async (userId) => {
  await redisDel(`refresh:${userId}`);
};

export const sendTokenResponse = async (res, user, statusCode = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  await storeRefreshToken(user._id.toString(), refreshToken);

  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};