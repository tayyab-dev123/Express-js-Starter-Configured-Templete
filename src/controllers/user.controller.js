// import asyncHandler from '../utils/asyncHandler.js';
import asyncHandler from 'express-async-handler';
import apiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      'Error while generating access token and refresh token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  //1) get user details from frontend
  console.log('1 req.body:', req.body);
  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field.trim() === '')
  ) {
    throw new apiError(400, 'All fields are required');
  }
  //2) check if user already exists: username, email
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  console.log('2 userExists:', userExists);
  if (userExists) {
    throw new apiError(400, 'Username or email already exists');
  }
  //3) check for images, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // Make cover image optional
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  console.log('3 avatarLocalPath:', avatarLocalPath);
  //   console.log('4 req files:', req.files);
  //4) upload them to cloudinary, avatar
  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar file is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new apiError(500, 'Error uploading avatar');
  }

  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  console.log('5 User:', user);

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  console.log('6 createdUser:', createdUser);

  if (!createdUser) {
    throw new apiError(500, 'Error creating user');
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, 'User created successfully'));
});

const loginRegister = asyncHandler(async (req, res) => {
  // get user details from frontend
  // get user
  // check if user exists
  // check if password is correct
  // generate access token
  // generate refresh token
  // save refresh token
  // return response

  //1) get user details from frontend
  const { username, email, password } = req.body;
  //   if (![username, email, password].some((field) => field.trim() === '')) {
  //     throw new apiError(400, 'All fields are required');
  //   }

  if (!(username || email)) {
    throw new apiError(400, 'Username or email is required');
  }

  if (!password) {
    throw new apiError(400, 'Password is required');
  }

  //2) get user
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new apiError(400, 'User not found');
  }
  //3) check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new apiError(400, 'Invalid credentials');
  }

  //4) generate access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  //5) return response
  const option = {
    httpOnly: true,
    secure: true,
    // secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(200)
    .cookie('refreshToken', refreshToken, option)
    .cookie('accessToken', accessToken, option)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'Login successful'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: undefined },
    {
      new: true,
    }
  );
  const option = {
    httpOnly: true,
    secure: true,
    // secure: process.env.NODE_ENV === 'production',
  };
  res
    .status(200)
    .clearCookie('refreshToken', option)
    .clearCookie('accessToken', option)
    .json(new apiResponse(200, {}, 'Logout successful'));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new apiError(400, 'All fields are required');
  }
  if (oldPassword === newPassword) {
    throw new apiError(
      400,
      'New password should be different from old password'
    );
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(400, 'User not found');
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(400, 'Invalid password');
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, {}, 'Password updated successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, req.user, 'User found'));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;
  if (!fullName || !username || !email) {
    throw new apiError(400, 'All fields are required');
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        username,
        email,
      },
    },
    { new: true }
  ).select('-password -refreshToken');
  if (!updatedUser) {
    throw new apiError(500, 'Error updating user details');
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updatedUser, 'User details updated successfully')
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, 'Unable to get avatar file path');
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new apiError(500, 'Error uploading avatar');
  }
  const updatedAvatar = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );
  if (!updatedAvatar) {
    throw new apiError(500, 'Error updating avatar');
  }

  // Delete old avatar from cloudinary

  return res
    .status(200)
    .json(new apiResponse(200, updatedAvatar, 'Avatar updated successfully'));
});
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, 'Unable to get cober image file path');
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new apiError(500, 'Error uploading cover image');
  }
  const updatedCoverImage = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  );
  if (!updatedCoverImage) {
    throw new apiError(500, 'Error updating avatar');
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedCoverImage,
        'Cover image updated successfully'
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || req.headers;
  if (!refreshToken) {
    throw new apiError(400, 'Refresh token not found');
  }
  const decodedToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decodedToken) {
    throw new apiError(400, 'Invalid refresh token');
  }
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new apiError(400, 'User not found');
  }
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  if (!accessToken || !newRefreshToken) {
    throw new apiError(500, 'Error generating access token and refresh token');
  }
  return res.status(200).json(
    new apiResponse(
      200,
      {
        accessToken,
        refreshToken: newRefreshToken,
      },
      'Access token refreshed successfully'
    )
  );
});

export {
  registerUser,
  loginRegister,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};
