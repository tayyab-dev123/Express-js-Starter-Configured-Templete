// import asyncHandler from '../utils/asyncHandler.js';
import asyncHandler from 'express-async-handler';
import apiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

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

  if (!username || !email) {
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

export { registerUser, loginRegister, logoutUser };
