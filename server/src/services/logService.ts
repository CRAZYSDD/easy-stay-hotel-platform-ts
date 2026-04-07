import { prisma } from '../db/prisma.js';

export const createLog = async (userId, action, detail) => {
  await prisma.operationLog.create({
    data: { userId, action, detail },
  });
};
