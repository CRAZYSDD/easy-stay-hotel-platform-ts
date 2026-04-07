import { ZodError } from 'zod';
import { fail } from '../utils/response.js';

export const errorHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json(fail(40001, '参数校验失败', error.flatten()));
  }

  console.error(error);
  return res.status(500).json(fail(50000, error.message || '服务器内部错误'));
};
