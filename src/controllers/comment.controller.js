import mongoose from 'mongoose';
import { Comment } from '../models/comment.model.js';
import ApiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from 'express-async-handler';

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const videoComment = [
    {
      $match: {},
    },
  ];
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const user_id = req.user._id;
  const { content } = req.body;
  console.log('________________________________-', {
    content,
    user_id,
  });

  const addedComment = await Comment.create({
    owner: user_id,
    content: content,
    createdAt: new Date(),
  });

  if (!addedComment) {
    return res.status(404).json(new ApiError(404, 'Unable to add comment'));
  }
  return res
    .status(201)
    .json(new apiResponse(201, addedComment, 'Comment added'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  console.log({
    commentId,
    content,
  });

  if (!content?.trim()) {
    throw new ApiError(400, 'Content is required');
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, updatedComment, 'Comment updated successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  console.log({ commentId });

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }
  const comment = Comment.findById(commentId);
  console.log({ comment });

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }
  const deletedComment = await Comment.deleteOne(comment);

  return res
    .status(200)
    .json(new apiResponse(200, deletedComment, 'Comment deleted successfully'));
});

export { getVideoComments, addComment, updateComment, deleteComment };
