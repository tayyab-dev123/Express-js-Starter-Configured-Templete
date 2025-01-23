import { Router } from 'express';
import {
  createVideo,
  deleteVideo,
  getVideo,
  getVideos,
  updateVideo,
} from '../controllers/video.controller.js';

const route = Router();

route.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
