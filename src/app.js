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
import errorHandler from './middlewares/errorHandler.middleware.js';
import commentRoutes from './routes/comment.routes.js';

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/comments', commentRoutes);
// Error handling middleware
// app.use(errorHandler);

export default app;
