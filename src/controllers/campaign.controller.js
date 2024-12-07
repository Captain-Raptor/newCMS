const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { campaignService, campaignApiService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const { extractToken } = require('../utils/authUtils');

/**
 * Upload Campaign data
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const uploadCampaign = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('uploadCampaign')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to upload campaign data');
  }

  const { campaignApiId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(campaignApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign API ID');
  }

  const campaignApi = await campaignApiService.getCampaignApiById(campaignApiId);

  if (!campaignApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign API not found');
  }

  if (user.companyId.toString() !== campaignApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign API');
  }

  const campaignDataArray = req.body;

  // Process each data item in the array and store in the database
  const uploadedCampaigns = await campaignService.uploadCampaignData(
    campaignDataArray,
    user.companyId,
    campaignApiId,
    campaignApi.name
  );

  // Transforming the response to include custom fields
  const formattedCampaigns = uploadedCampaigns.map((campaign) => ({
    isOpened: campaign.isOpened,
    _id: campaign._id,
    name: campaign.name,
    type: campaign.type,
    value: campaign.value,
    link: campaign.link,
  }));

  res.status(httpStatus.CREATED).send({
    message: 'Campaign data uploaded successfully',
    uploadedCampaigns: formattedCampaigns,
  });
});

// Export Campaigns as CSV
const exportCsvCampaign = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('exportCampaign')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to export campaign data');
  }

  const { campaignApiId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(campaignApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign API ID');
  }

  // Ensure the campaign API belongs to the user's company
  const campaignApi = await campaignApiService.getCampaignApiById(campaignApiId);
  if (!campaignApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign API not found');
  }

  if (user.companyId.toString() !== campaignApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign API');
  }

  // Fetch campaigns based on the campaignApiId
  const campaigns = await campaignService.getCampaignsByApiId(campaignApiId);

  // Format response data
  const csvData = campaigns.map((campaign) => ({
    name: campaign.name,
    type: campaign.type,
    value: campaign.value,
    tracking_link: `https://imaggar.in/v1/campaign/openedcampaign/${campaign._id}`,
  }));

  // Send CSV data as response
  res.status(httpStatus.OK).send(csvData);
});

// Get Campaigns with Pagination
const getCampaigns = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('getCampaign')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to get campaign data');
  }

  const { campaignApiId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(campaignApiId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign API ID');
  }

  // Ensure the campaign API belongs to the user's company
  const campaignApi = await campaignApiService.getCampaignApiById(campaignApiId);
  if (!campaignApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign API not found');
  }

  if (user.companyId.toString() !== campaignApi.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign API');
  }

  // Get pagination parameters and convert to integers
  const page = parseInt(req.query.page, 10) || 1; // Default to 1 if NaN
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if NaN
  const skip = (page - 1) * limit;

  // Fetch campaigns with pagination and total count
  const [campaigns, total] = await Promise.all([
    campaignService.getCampaignsByApiId(campaignApiId, skip, limit),
    campaignService.countCampaignsByApiId(campaignApiId), // Implement this method
  ]);

  // Format response data
  const formattedCampaigns = campaigns.map((campaign) => ({
    name: campaign.name,
    type: campaign.type,
    value: campaign.value,
    isOpened: campaign.isOpened,
  }));

  res.status(httpStatus.OK).send({
    total, // Total number of campaigns
    page, // Current page
    limit, // Limit of campaigns per page
    totalPages: Math.ceil(total / limit), // Total pages based on the limit
    campaigns: formattedCampaigns,
  });
});

const openCampaign = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  // Validate the campaignId format
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign ID');
  }

  // Find the campaign by ID
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  // Update the campaign's isOpened field and set the openAt timestamp
  campaign.isOpened = true;
  campaign.openAt = new Date(); // Add this line to create an openAt field
  await campaign.save();

  // Redirect to the specified link
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return res.redirect(campaign.link);
});

const deleteCampaign = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('deleteCampaign')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to delete campaign data');
  }

  const { campaignId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Campaign ID');
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  if (user.companyId.toString() !== campaign.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the campaign');
  }

  await Campaign.findByIdAndDelete(campaignId);

  res.status(httpStatus.OK).send({
    message: 'Campaign deleted successfully',
  });
});

// Export the delete function
module.exports = {
  uploadCampaign,
  exportCsvCampaign,
  getCampaigns,
  openCampaign,
  deleteCampaign,
};
