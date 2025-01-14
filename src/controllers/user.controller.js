// import asyncHandler from '../utils/asyncHandler.js';
import asyncHandler from 'express-async-handler';

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Register route' });
});

export { registerUser };
