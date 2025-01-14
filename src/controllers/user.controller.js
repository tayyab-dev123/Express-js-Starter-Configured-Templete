// import asyncHandler from '../utils/asyncHandler.js';
import asyncHandler from 'express-async-handler';
import apiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import apiResponse from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log('3 avatarLocalPath:', avatarLocalPath);
  console.log('4 req files:', req.files);
  //4) upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar || !coverImage) {
    throw new apiError(500, 'Error uploading images');
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar?.url || '',
    coverImage: coverImage?.url || '',
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new apiError(500, 'Error creating user');
  }

  return res
    .status(201)
    .json(apiResponse(201, createdUser, 'User created successfully'));
});

export { registerUser };
