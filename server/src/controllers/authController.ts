import { prisma } from '../db/prisma.js';
import { login, register } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import { loginSchema, registerSchema } from '../utils/validators.js';

export const registerController = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  res.json(success(await register(payload), '注册成功'));
});

export const loginController = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  res.json(success(await login(payload), '登录成功'));
});

export const meController = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
  res.json(success(user));
});
