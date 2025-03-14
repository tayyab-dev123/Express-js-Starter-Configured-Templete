import mongoose, { isValidObjectId } from 'mongoose';
import { Tweet } from '../models/tweet.model.js';
import { User } from '../models/user.model.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from 'express-async-handler';

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
