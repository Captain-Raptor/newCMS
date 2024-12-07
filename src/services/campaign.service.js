/* eslint-disable no-return-await */
const Campaign = require('../models/campaign.model');

/**
 * Upload campaign data
 * @param {Array} campaignDataArray - Array of campaign data objects
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @param {mongoose.Schema.Types.ObjectId} campaignApiId - The campaign API ID
 * @param {String} campaignApiName - The campaign API name
 * @returns {Promise<Array>} - Returns an array of saved campaign data documents
 */
const uploadCampaignData = async (campaignDataArray, companyId, campaignApiId, campaignApiName) => {
  const campaigns = campaignDataArray.map((data) => ({
    name: data.name,
    type: data.type,
    value: data.value,
    link: data.link,
    isOpened: false,
    companyID: companyId,
    campaignApiID: campaignApiId,
    campaignApiName,
  }));

  const savedCampaigns = await Campaign.insertMany(campaigns);
  return savedCampaigns;
};

// Get campaigns by API ID with optional pagination
const getCampaignsByApiId = async (campaignApiId, skip = 0, limit = 0) => {
  const query = { campaignApiID: campaignApiId };
  const campaigns = await Campaign.find(query).skip(skip).limit(limit).lean(); // Use lean for better performance when not modifying the documents
  return campaigns;
};

// In your campaignService.js
const countCampaignsByApiId = async (campaignApiId) => {
  return await Campaign.countDocuments({ campaignApiID: campaignApiId });
};

module.exports = {
  uploadCampaignData,
  getCampaignsByApiId,
  countCampaignsByApiId, // Export the new method
};
