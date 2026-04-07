import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { signToken } from '../utils/jwt.js';

const formatAuthUser = (user: any) => ({
  token: signToken({
    id: user.id,
    username: user.username,
    role: user.role,
  }),
  user: {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  },
});

export const register = async ({ username, password, role }: any) => {
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) throw new Error('用户名已存在');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash, role },
  });
  return formatAuthUser(user);
};

export const login = async ({ username, password }: any) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('账号或密码错误');

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) throw new Error('账号或密码错误');

  return formatAuthUser(user);
};
