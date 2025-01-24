import { Router } from 'express';
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import jwtVerify from '../middlewares/auth.middleware.js';

const route = Router();

route.use(jwtVerify); // Apply jwtVerify middleware to all routes in this file

//Create a new comment
route.route('/:videoId').post(addComment);

export default route;
