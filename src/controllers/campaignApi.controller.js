const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { campaignApiService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');

/**
 * Create a Campaign API
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createCampaignApi = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('createCampaignApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to create a campaign API');
  }

  const { name } = req.body;

  const campaignApi = await campaignApiService.createCampaignApi({
    name,
    companyID: user.companyId,
    createdBy: user._id,
    updatedBy: user._id,
  });

  // Return only the name and _id fields
  res.status(httpStatus.CREATED).send({
    message: 'Campaign API successfully created',
    campaignApi: {
      _id: campaignApi._id,
      name: campaignApi.name,
    },
  });
});

/**
 * Get Campaign APIs by Company ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getCampaignApi = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('getCampaignApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to get campaign APIs');
  }

  const campaignApis = await campaignApiService.getCampaignApiByCompanyId(user.companyId);

  res.status(httpStatus.OK).send(campaignApis);
});

/**
 * Delete a Campaign API by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const deleteCampaignApi = catchAsync(async (req, res) => {
  const campaignApiId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(campaignApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign API ID');
  }

  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('deleteCampaignApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to delete a campaign API');
  }

  const campaignApi = await campaignApiService.getCampaignApiById(campaignApiId);

  if (!campaignApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign API not found');
  }

  if (user.companyId.toString() !== campaignApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign API');
  }

  await campaignApiService.deleteCampaignApiById(campaignApiId);

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Update a Campaign API
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const updateCampaignApi = catchAsync(async (req, res) => {
  const campaignApiId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(campaignApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign API ID');
  }

  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('editCampaignApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to update a campaign API');
  }

  const campaignApi = await campaignApiService.getCampaignApiById(campaignApiId);

  if (!campaignApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign API not found');
  }

  if (user.companyId.toString() !== campaignApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign API');
  }

  const { name } = req.body;

  campaignApi.name = name;
  await campaignApi.save();

  res.status(httpStatus.OK).send({ message: 'Campaign API name updated successfully', campaignApi });
});

module.exports = {
  createCampaignApi,
  getCampaignApi,
  deleteCampaignApi,
  updateCampaignApi,
};
