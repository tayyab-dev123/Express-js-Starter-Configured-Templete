import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express({
  limit: '50kb',
});
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: '50kb' })); // for parsing application/x-www-form-urlencoded which is the default content type for forms
app.use(cookieParser());

// Routes
import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users', userRoutes);

export default app;
