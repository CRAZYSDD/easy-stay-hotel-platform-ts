import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { success } from './utils/response.js';

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json(success({ status: 'ok' })));
  app.use('/api/auth', authRoutes);
  app.use('/api/location', locationRoutes);
  app.use('/api', hotelRoutes);
  app.use(errorHandler);

  return app;
};
