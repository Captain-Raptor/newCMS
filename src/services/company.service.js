const Company = require('../models/company.model');

/**
 * Create a company
 * @param {Object} companyData - The company data
 * @returns {Promise<Company>}
 */
const createCompany = async (companyData) => {
  const company = new Company(companyData);
  await company.save();
  return company;
};

/**
 * Get a company by ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @returns {Promise<Company>}
 */
const getCompanyById = async (companyId) => {
  return Company.findById(companyId);
};

/**
 * Update a company by ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Company>}
 */
const updateCompanyById = async (companyId, updateData) => {
  return Company.findByIdAndUpdate(companyId, updateData, { new: true });
};

/**
 * Delete a company by ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @returns {Promise<Company>}
 */
const deleteCompanyById = async (companyId) => {
  return Company.findByIdAndDelete(companyId);
};

module.exports = {
  createCompany,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
};
