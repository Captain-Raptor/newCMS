const Website = require('../models/webiste.model'); // Corrected typo

/**
 * Create a website
 * @param {Object} websiteData - The website data
 * @returns {Promise<Website>}
 */
const createWebsite = async (websiteData) => {
  const website = new Website(websiteData);
  try {
    await website.save();
    return website;
  } catch (error) {
    throw new Error('Error creating website: ' + error.message);
  }
};

/**
 * Update a website by ID
 * @param {mongoose.Schema.Types.ObjectId} websiteId - The website ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Website>}
 */
const updateWebsiteById = async (websiteId, updateData) => {
  try {
    const updatedWebsite = await Website.findByIdAndUpdate(websiteId, updateData, { new: true });
    if (!updatedWebsite) {
      throw new Error('Website not found');
    }
    return updatedWebsite;
  } catch (error) {
    throw new Error('Error updating website: ' + error.message);
  }
};

/**
 * Get a website by ID
 * @param {mongoose.Schema.Types.ObjectId} websiteId - The website ID
 * @returns {Promise<Website>}
 */
const getWebsiteById = async (websiteId) => {
  try {
    const website = await Website.findById(websiteId);
    if (!website) {
      throw new Error('Website not found');
    }
    console.log(website,"from service")
    return website;
  } catch (error) {
    throw new Error('Error retrieving website: ' + error.message);
  }
};

/**
 * Delete a website by ID
 * @param {mongoose.Schema.Types.ObjectId} websiteId - The website ID
 * @returns {Promise<void>}
 */
const deleteWebsiteById = async (websiteId) => {
  try {
    const website = await Website.findByIdAndDelete(websiteId);
    if (!website) {
      throw new Error('Website not found');
    }
  } catch (error) {
    throw new Error('Error deleting website: ' + error.message);
  }
};

/**
 * Get all websites by company ID with pagination
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of results per page
 * @returns {Promise<Object>} - Contains websites array and total count
 */
const getWebsitesByCompanyId = async (companyId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  try {
    const websites = await Website.find({ companyId }).skip(skip).limit(limit).exec();
    const total = await Website.countDocuments({ companyId }).exec();
    return { websites, total };
  } catch (error) {
    throw new Error('Error fetching websites: ' + error.message);
  }
};

/**
 * Get websites by company ID and website API ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @param {String} websiteApiId - The website API ID
 * @returns {Promise<Website[]>}
 */


const getWebsitesByApiId = async (companyId, websiteApiId) => {
  try {
    return await Website.find({ companyId, websiteApiId });
  } catch (error) {
    throw new Error('Error fetching websites by API ID: ' + error.message);
  }
};

module.exports = {
  createWebsite,
  updateWebsiteById,
  getWebsiteById,
  deleteWebsiteById,
  getWebsitesByCompanyId,
  getWebsitesByApiId,
};
