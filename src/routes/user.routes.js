import { Router } from 'express';
import {
  loginRegister,
  logoutUser,
  registerUser,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import jwtVerify from '../middlewares/auth.middleware.js';

const route = Router();

route.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);

route.route('/login').post(loginRegister);
route.route('/logout').post(jwtVerify, logoutUser);

export default route;
