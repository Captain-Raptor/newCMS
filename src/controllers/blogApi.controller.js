const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { blogApiService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');
const config = require('../config/config');

/**
 * Create a Blog API
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createBlogApi = catchAsync(async (req, res) => {
  // Extract token from the authorization header
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

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('createBlogApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to create a blog API');
  }

  const { name } = req.body; // Extract name from request body
  console.log(req.body)   
  // Create blog API
  const blogApi = await blogApiService.createBlogApi({
    name, // Pass the name to the service
    companyID: user.companyId,
    createdBy: user._id,
    updatedBy: user._id,
  });

  res.status(httpStatus.CREATED).send({
    message: 'Blog API successfully created',
    api: `${config.apiBaseUrl}/blogs/getBlogList/${blogApi._id}`,
  });
});

/**
 * Get Blog APIs by Company ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getBlogApi = catchAsync(async (req, res) => {
  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('getBlogApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to get blog APIs');
  }

  // Get all blog APIs by the user's company ID
  const blogApis = await blogApiService.getBlogApiByCompanyId(user.companyId);

  res.status(httpStatus.OK).send(blogApis);
});

/**
 * Delete a Blog API by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const deleteBlogApi = catchAsync(async (req, res) => {
  const blogApiId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(blogApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Blog API ID');
  }

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('deleteBlogApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to delete a blog API');
  }

  // Retrieve the blog API and check if it belongs to the same company as the user
  const blogApi = await blogApiService.getBlogApiById(blogApiId);

  if (!blogApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog API not found');
  }

  if (user.companyId.toString() !== blogApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the blog API');
  }

  // Delete the blog API
  await blogApiService.deleteBlogApiById(blogApiId);

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Update a Blog API
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const updateBlogApi = catchAsync(async (req, res) => {
  const blogApiId = req.params.id;
  console.log(blogApiId)
  if (!mongoose.Types.ObjectId.isValid(blogApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Blog API ID');
  }

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('editBlogApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to update a blog API');
  }

  // Retrieve the blog API and check if it belongs to the same company as the user
  const blogApi = await blogApiService.getBlogApiById(blogApiId);

  if (!blogApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog API not found');
  }

  if (user.companyId.toString() !== blogApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the blog API');
  }

  const { name } = req.body; // Extract the new name from the request body
  console.log(req.body)
  // Update the blog API name
  blogApi.name = name;
  
  await blogApi.save();

  res.status(httpStatus.OK).send({ message: 'Blog API name updated successfully', blogApi });
});

module.exports = {
  createBlogApi,
  getBlogApi,
  deleteBlogApi,
  updateBlogApi, // Export the update controller
};
