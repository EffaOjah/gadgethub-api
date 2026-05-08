import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import gadgetRoutes from './routes/gadgetRoutes';
import userRoutes from './routes/userRoutes';
import sellerRoutes from './routes/sellerRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gadgets', gadgetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to GadgetHub API' });
});

export default app;
