import { Router } from 'express';
import {
  changeUserPassword,
  getCurrentUser,
  getUserChennelProfile,
  getWatchHistory,
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
route.route('/updateAccountDetails').patch(jwtVerify, updateAccountDetails);
route
  .route('/updateAvatar')
  .patch(jwtVerify, upload.single('avatar'), updateAvatar);
route
  .route('/updateCoverImage')
  .post(jwtVerify, upload.single('coverImage'), updateCoverImage);

route.route('/c/:username').get(jwtVerify, getUserChennelProfile);
route.route('/getWatchHistory').get(jwtVerify, getWatchHistory);

export default route;
