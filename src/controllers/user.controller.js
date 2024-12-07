/* eslint-disable no-console */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService, companyService, s3Service } = require('../services');
const { extractToken } = require('../utils/authUtils');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Create a new CMS sub-user
 * @param {Object} req
 * @param {Object} res
 */
const createCmsSubUser = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Handle profile picture upload if provided
  let profilePictureUrl = null;
  if (req.file) {
    // Access the uploaded file here
    const profilePicture = req.file;

    // Validate file size and type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(profilePicture.mimetype)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid profile picture format. Allowed formats: jpg, jpeg, png');
    }
    if (profilePicture.size > 2 * 1024 * 1024) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile picture exceeds the maximum file size of 2 MB');
    }

    // Upload the file to S3
    const profilePictureS3Path = `profilePictures/${userId}_profile_${Date.now()}.${profilePicture.originalname
      .split('.')
      .pop()}`;
    const uploadResponse = await s3Service.uploadFile(profilePictureS3Path, profilePicture.buffer);
    profilePictureUrl = uploadResponse.Location; // Get the URL of the uploaded file
  }

  // Create the new user with the profile picture URL
  const newUser = await userService.createCmsSubUser(
    {
      ...req.body,
      profilePicture: profilePictureUrl, // Save the profile picture URL
    },
    token
  );

  res.status(httpStatus.CREATED).send(newUser);
});

/**
 * Update a CMS sub-user
 * @param {Object} req
 * @param {Object} res
 */
const updateCmsSubUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  // Find the user and check permissions
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Handle profile picture update if provided
  let profilePictureUrl = user.profilePicture; // Default to existing profile picture URL
  if (req.file) {
    const profilePicture = req.file;

    // Validate file size and type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(profilePicture.mimetype)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid profile picture format. Allowed formats: jpg, jpeg, png');
    }
    if (profilePicture.size > 2 * 1024 * 1024) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile picture exceeds the maximum file size of 2 MB');
    }

    // Delete the old profile picture from S3 if it exists
    if (profilePictureUrl) {
      await s3Service.deleteS3File(`profilePictures/${profilePictureUrl.split('/').pop()}`);
    }

    // Upload the new profile picture to S3
    const profilePictureS3Path = `profilePictures/${userId}_profile_${Date.now()}.${profilePicture.originalname
      .split('.')
      .pop()}`;
    const uploadResponse = await s3Service.uploadFile(profilePictureS3Path, profilePicture.buffer);
    profilePictureUrl = uploadResponse.Location; // Get the URL of the uploaded file
  }

  // Prepare the updated user data
  const updatedUserData = {
    ...req.body,
    profilePicture: profilePictureUrl, // Save the profile picture URL if uploaded
  };

  // Update the user in the database
  const updatedUser = await userService.updateCmsSubUser(userId, updatedUserData, token);
  res.status(httpStatus.OK).send(updatedUser);
});

/**
 * Delete a CMS sub-user
 * @param {Object} req
 * @param {Object} res
 */
const deleteCmsSubUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  // Ensure the user ID from the token is valid
  const userIdFromToken = decodedToken.user;
  if (!mongoose.Types.ObjectId.isValid(userIdFromToken)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  // Find the user to be deleted
  const userToDelete = await User.findById(userId);
  if (!userToDelete) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Delete the profile picture from S3 if it exists
  if (userToDelete.profilePicture) {
    const profilePictureKey = userToDelete.profilePicture.split('/').pop(); // Extract the filename
    await s3Service.deleteS3File(`profilePictures/${profilePictureKey}`);
  }

  // Delete the user from the database
  await userService.deleteCmsSubUser(userId, token);

  res.status(httpStatus.NO_CONTENT).send(); // Send 204 No Content after successful deletion
});

/**
 * Get CMS sub-users for the authenticated user
 * @param {Object} req
 * @param {Object} res
 */
const getCmsSubUsers = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  // Get the user ID from the token
  const userId = decodedToken.user;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get pagination options from query parameters
  const { page = 1, limit = 10 } = req.query;

  // Query sub-users based on the user's company ID
  const filter = { companyId: user.companyId, role: 'CMS_SUB_USER' };
  const options = {
    page: Number(page),
    limit: Number(limit) > 100 ? 100 : Number(limit), // Additional check to enforce the max limit
    sortBy: 'createdAt:asc', // You can adjust this as needed
  };

  const subUsers = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).send(subUsers);
});
const getProfileInfo = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  // Get the user ID from the token
  const userId = decodedToken.user;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  const user = await User.findById(userId).populate('companyId'); // Populate company details
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Retrieve company details using companyId from the user
  let companyDetails = null;
  if (user.companyId) {
    companyDetails = await companyService.getCompanyById(user.companyId); // Get company details
    if (!companyDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }
  }

  // Return the user's profile information along with company details
  const profileInfo = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    company: companyDetails
      ? {
          id: companyDetails._id,
          name: companyDetails.name,
          email: companyDetails.email,
          address: companyDetails.address,
          country: companyDetails.country,
          state: companyDetails.state,
          city: companyDetails.city,
          pincode: companyDetails.pincode,
        }
      : null, // Include company details if available
  };

  res.status(httpStatus.OK).send(profileInfo);
});

module.exports = {
  createCmsSubUser,
  updateCmsSubUser,
  deleteCmsSubUser,
  getCmsSubUsers,
  getProfileInfo,
};
