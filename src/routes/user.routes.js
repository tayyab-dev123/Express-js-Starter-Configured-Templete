import { Router } from 'express';
import {
  changeUserPassword,
  getCurrentUser,
  loginRegister,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
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
route.route('/refresh-token').post(refreshAccessToken);
route.route('/changeUserPassword').post(jwtVerify, changeUserPassword);
route.route('/getCurrentUser').post(jwtVerify, getCurrentUser);
route.route('/updateAccountDetails').post(jwtVerify, updateAccountDetails);
route
  .route('/updateAvatar')
  .post(jwtVerify, upload.single('avatar'), updateAvatar);
route
  .route('/updateCoverImage')
  .post(jwtVerify, upload.single('coverImage'), updateCoverImage);

export default route;
