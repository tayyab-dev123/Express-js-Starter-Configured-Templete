import ApiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from 'express-async-handler';

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
});

export { healthcheck };
