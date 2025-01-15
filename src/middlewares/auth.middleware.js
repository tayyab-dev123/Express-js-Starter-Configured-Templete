import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';

const jwtVerify = asyncHandler(async (req, res, next) => {
  try {
    //get a token from req.cookies or req.headers
    const token =
      req.cookies?.accessToken ||
      req.headers('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'TOken not found for jwtVerify');
    }
    // verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // get user details
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, 'User not found for jwtVerify');
    }
    // attach user details to req.user
    req.user = user;
    // next()
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error.message || 'Unauthorized request in jwtVerify'
    );
  }
});

export default jwtVerify;
