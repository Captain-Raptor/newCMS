/* eslint-disable radix */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { blogService, s3Service, blogApiService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png']; // Define allowed formats
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB maximum file size

const createBlog = catchAsync(async (req, res) => {
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

  // Find the user and check their permissions
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('createBlog')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to create a blog');
  }

  const { blogApiId } = req.params;

  if (!blogApiId) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"blogApiId" is required');
  }

  // Fetch the Blog API details
  const blogApi = await blogApiService.getBlogApiById(blogApiId);
  if (!blogApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BlogApi not found');
  }

  const blogApiCompanyId = blogApi.companyID;

  // Ensure the user's companyId matches the blogApi's companyId
  if (String(user.companyId) !== String(blogApiCompanyId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to create a blog for this company');
  }

  console.log('Incoming request body:', req.body);
  console.log('Incoming request files:', req.files);

  const { heading, subheading, bodyContent } = req.body;

  // Validate the required files (bannerImage, thumbnailImage)
  const bannerImage = req.files.find((file) => file.fieldname === 'bannerImage');
  const thumbnailImage = req.files.find((file) => file.fieldname === 'thumbnailImage');

  if (!bannerImage || !thumbnailImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Banner image and thumbnail image are required');
  }

  // Validate file formats
  const bannerImageExtension = bannerImage.originalname.split('.').pop().toLowerCase();
  const thumbnailImageExtension = thumbnailImage.originalname.split('.').pop().toLowerCase();

  if (!ALLOWED_FORMATS.includes(bannerImageExtension)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid banner image format. Allowed formats: jpg, jpeg, png');
  }

  if (!ALLOWED_FORMATS.includes(thumbnailImageExtension)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid thumbnail image format. Allowed formats: jpg, jpeg, png');
  }

  // Validate file sizes
  if (bannerImage.size > MAX_FILE_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Banner image exceeds the maximum file size of 2 MB');
  }

  if (thumbnailImage.size > MAX_FILE_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Thumbnail image exceeds the maximum file size of 2 MB');
  }

  // Upload files to S3
  const bannerS3Path = `blogFiles/${blogApiId}_banner_${Date.now()}.${bannerImageExtension}`;
  const thumbnailS3Path = `blogFiles/${blogApiId}_thumbnail_${Date.now()}.${thumbnailImageExtension}`;

  const bannerImageUrl = await s3Service.uploadFile(bannerS3Path, bannerImage.buffer);
  const thumbnailImageUrl = await s3Service.uploadFile(thumbnailS3Path, thumbnailImage.buffer);

  // Save blog details in the database
  const blogData = {
    blogApiName: blogApi.name, // Store the blogApi name
    blogApiId,
    companyId: blogApiCompanyId, // Use the companyId from blogApi
    heading,
    subheading,
    bodyContent,
    bannerImageUrl: bannerImageUrl.Location,
    thumbnailImageUrl: thumbnailImageUrl.Location,
    createdBy: userId, // Store the user who created the blog
    updatedBy: userId, // Initially, the creator is also the updater
  };

  const blog = await blogService.createBlog(blogData);
  res.status(httpStatus.CREATED).send(blog);
});

const updateBlog = catchAsync(async (req, res) => {
  const { blogId } = req.params;

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  // Find the user and check their permissions
  const user = await User.findById(userId);
  if (!user || !user.permissions.includes('editBlog')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to update the blog');
  }

  // Find the existing blog post
  const existingBlog = await blogService.getBlogById(blogId);
  if (!existingBlog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check if the blog's companyId matches the user's companyId
  if (existingBlog.companyId.toString() !== user.companyId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to edit this blog');
  }

  const { heading, subheading, bodyContent } = req.body;

  // Process banner and thumbnail images if provided
  let bannerImageUrl = existingBlog.bannerImageUrl;
  let thumbnailImageUrl = existingBlog.thumbnailImageUrl;

  const bannerImage = req.files.find((file) => file.fieldname === 'bannerImage');
  const thumbnailImage = req.files.find((file) => file.fieldname === 'thumbnailImage');

  const allowedImageTypes = ['image/jpeg', 'image/png'];

  // Validate thumbnail image format
  if (thumbnailImage && !allowedImageTypes.includes(thumbnailImage.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid thumbnail image format. Allowed formats: jpg, jpeg, png');
  }

  // Handle banner image update
  if (bannerImage) {
    // Delete the old banner image from S3
    await s3Service.deleteS3File(`blogFiles/${bannerImageUrl.split('/').pop()}`);

    // Upload new banner image to S3
    const bannerImageExtension = bannerImage.originalname.split('.').pop().toLowerCase();
    const bannerS3Path = `blogFiles/${blogId}_banner_${Date.now()}.${bannerImageExtension}`;
    bannerImageUrl = (await s3Service.uploadFile(bannerS3Path, bannerImage.buffer)).Location; // Ensure this returns a string
  }

  // Handle thumbnail image update
  if (thumbnailImage) {
    // Delete the old thumbnail image from S3
    await s3Service.deleteS3File(`blogFiles/${thumbnailImageUrl.split('/').pop()}`);

    // Upload new thumbnail image to S3
    const thumbnailImageExtension = thumbnailImage.originalname.split('.').pop().toLowerCase();
    const thumbnailS3Path = `blogFiles/${blogId}_thumbnail_${Date.now()}.${thumbnailImageExtension}`;
    thumbnailImageUrl = (await s3Service.uploadFile(thumbnailS3Path, thumbnailImage.buffer)).Location; // Ensure this returns a string
  }

  // Prepare the updated blog data
  const updatedBlogData = {
    heading: heading || existingBlog.heading,
    subheading: subheading || existingBlog.subheading,
    bodyContent: bodyContent || existingBlog.bodyContent,
    bannerImageUrl: bannerImageUrl || existingBlog.bannerImageUrl,
    thumbnailImageUrl: thumbnailImageUrl || existingBlog.thumbnailImageUrl,
    updatedBy: userId, // Update user
  };

  // Update the blog in the database
  const updatedBlog = await blogService.updateBlog(blogId, updatedBlogData);
  res.status(httpStatus.OK).send(updatedBlog);
});

const deleteBlog = catchAsync(async (req, res) => {
  const { blogId } = req.params;

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  // Find the user and check their permissions
  const user = await User.findById(userId);
  if (!user || !user.permissions.includes('deleteBlog')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to delete the blog');
  }

  // Find the existing blog post
  const existingBlog = await blogService.getBlogById(blogId);
  if (!existingBlog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check if the blog's companyId matches the user's companyId
  if (existingBlog.companyId.toString() !== user.companyId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to delete this blog');
  }

  // Delete the blog's images from S3
  await s3Service.deleteS3File(`blogFiles/${existingBlog.bannerImageUrl.split('/').pop()}`);
  await s3Service.deleteS3File(`blogFiles/${existingBlog.thumbnailImageUrl.split('/').pop()}`);

  // Delete the blog from the database
  await blogService.deleteBlog(blogId);

  res.status(httpStatus.NO_CONTENT).send(); // Send no content response
});

const getBlogById = catchAsync(async (req, res) => {
  const { blogId } = req.params;

  // Extract token from the authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;

  // Find the user and check their permissions
  const user = await User.findById(userId);
  if (!user || !user.permissions.includes('getBlog')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to get the blog');
  }

  // Fetch the blog by ID
  const blog = await blogService.getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Optionally, you can check if the user's companyId matches the blog's companyId
  if (blog.companyId.toString() !== user.companyId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to view this blog');
  }

  res.status(httpStatus.OK).send(blog);
});

const MAX_LIMIT = 10;

const getBlogByblogApiId = catchAsync(async (req, res) => {
  const { blogApiId } = req.params;
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided

  // Validate blogApiId
  if (!blogApiId) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"blogApiId" is required');
  }

  // Validate limit
  if (limit > MAX_LIMIT) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Limit cannot exceed ${MAX_LIMIT}`);
  }

  // Fetch blogs based on blogApiId with pagination
  const { blogs, total } = await blogService.getBlogsByBlogApiId(blogApiId, page, limit);

  if (!blogs || blogs.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No blogs found for this blogApiId');
  }

  // Map the response to include only the required fields
  const minimizedBlogs = blogs.map((blog) => ({
    _id: blog._id,
    heading: blog.heading,
    subheading: blog.subheading,
    bodyContent: blog.bodyContent,
    bannerImageUrl: blog.bannerImageUrl,
    thumbnailImageUrl: blog.thumbnailImageUrl,
    publishedAt: blog.createdAt,
  }));

  res.status(httpStatus.OK).send({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit), // Calculate total pages
    blogs: minimizedBlogs,
  });
});
module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogByblogApiId,
};
