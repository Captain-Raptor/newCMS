const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { websiteService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');

/**
 * Create a Website
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createWebsite = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');

  const userId = decodedToken.user;
  const user = await User.findById(userId);
  if (!user || !user.permissions.includes('createWebsite')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to create a website');
  }

  const { name, essentials, seo, pageData } = req.body;

  const website = await websiteService.createWebsite({
    name,
    essentials,
    seo,
    pageData,
    companyId: user.companyId,
    createdBy: user._id,
    updatedBy: user._id,
  });
 
  res.status(httpStatus.CREATED).send({
    message: 'Website successfully created',
    websiteId: website._id,
  });
});

/**
 * List all Websites belonging to the user’s company
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getWebsites = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');
  if (!decodedToken) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');

  const userId = decodedToken.user;
  const user = await User.findById(userId);
  if (!user || !user.permissions.includes('listWebsites')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to list websites');
  }

  const websites = await websiteService.getWebsitesByCompanyId(user.companyId);
  res.status(httpStatus.OK).send({ success: true, data: websites });
});

/**
 * Get a single Website by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getWebsiteById = catchAsync(async (req, res) => {
  const websiteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Website ID');
  }

  const website = await websiteService.getWebsiteById(websiteId);
  if (!website) throw new ApiError(httpStatus.NOT_FOUND, 'Website not found');

  res.status(httpStatus.OK).send(website);
});

/**
 * Update a Website by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const updateWebsite = catchAsync(async (req, res) => {
  const websiteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Website ID');
  }

  const { name, essentials, seo, pageData } = req.body;
  const updatedWebsite = await websiteService.updateWebsiteById(websiteId, {
    name,
    essentials,
    seo,
    pageData,
  });

  res.status(httpStatus.OK).send({
    message: 'Website updated successfully',
    website: updatedWebsite,
  });
});

/**
 * Delete a Website by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const deleteWebsite = catchAsync(async (req, res) => {
  const websiteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Website ID');
  }

  await websiteService.deleteWebsiteById(websiteId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createWebsite,
  getWebsites,
  getWebsiteById,
  updateWebsite,
  deleteWebsite,
};
