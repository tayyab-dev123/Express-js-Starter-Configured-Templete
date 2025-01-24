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
route.route('/add-comment').post(addComment);
route.route('/update-comment/:commentId').patch(updateComment);
route.route('/delete-comment/:commentId').delete(deleteComment);
export default route;
