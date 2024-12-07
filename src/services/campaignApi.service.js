const CampaignApi = require('../models/campaignApi.model');

/**
 * Create a campaign API
 * @param {Object} campaignData - The campaign data
 * @returns {Promise<CampaignApi>}
 */
const createCampaignApi = async (campaignData) => {
  const campaignApi = new CampaignApi(campaignData);
  await campaignApi.save();
  return campaignApi;
};

/**
 * Get a campaign API by ID
 * @param {mongoose.Schema.Types.ObjectId} campaignApiId - The campaign API ID
 * @returns {Promise<CampaignApi>}
 */
const getCampaignApiById = async (campaignApiId) => {
  return CampaignApi.findById(campaignApiId);
};

/**
 * Get all campaign APIs by company ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @returns {Promise<CampaignApi[]>}
 */
const getCampaignApiByCompanyId = async (companyId) => {
  return CampaignApi.find({ companyID: companyId });
};

/**
 * Delete a campaign API by ID
 * @param {mongoose.Schema.Types.ObjectId} campaignApiId - The campaign API ID
 * @returns {Promise<CampaignApi>}
 */
const deleteCampaignApiById = async (campaignApiId) => {
  return CampaignApi.findByIdAndDelete(campaignApiId);
};

/**
 * Update a campaign API by ID
 * @param {mongoose.Schema.Types.ObjectId} campaignApiId - The campaign API ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<CampaignApi>}
 */
const updateCampaignApiById = async (campaignApiId, updateData) => {
  return CampaignApi.findByIdAndUpdate(campaignApiId, updateData, { new: true });
};

module.exports = {
  createCampaignApi,
  getCampaignApiById,
  getCampaignApiByCompanyId,
  deleteCampaignApiById,
  updateCampaignApiById,
};
