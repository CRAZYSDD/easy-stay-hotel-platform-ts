import { verifyToken } from '../utils/jwt.js';
import { fail } from '../utils/response.js';

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json(fail(40101, '未登录或登录已过期'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json(fail(40102, 'Token 无效'));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json(fail(40301, '没有访问权限'));
  }
  next();
};
