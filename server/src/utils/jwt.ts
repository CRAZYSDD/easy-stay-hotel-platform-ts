import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'easy-stay-secret';

export const signToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: '7d',
  });

export const verifyToken = (token) => jwt.verify(token, getSecret());
