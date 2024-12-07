const BlogApi = require('../models/blogApi.model');

/**
 * Create a blog API
 * @param {Object} blogData - The blog data
 * @returns {Promise<BlogApi>}
 */
const createBlogApi = async (blogData) => {
  const blogApi = new BlogApi(blogData);
  await blogApi.save();
  return blogApi;
};

/**
 * Get a blog API by ID
 * @param {mongoose.Schema.Types.ObjectId} blogApiId - The blog API ID
 * @returns {Promise<BlogApi>}
 */
const getBlogApiById = async (blogApiId) => {
  return BlogApi.findById(blogApiId);
};

/**
 * Get all blog APIs by company ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @returns {Promise<BlogApi[]>}
 */
const getBlogApiByCompanyId = async (companyId) => {
  return BlogApi.find({ companyID: companyId });
};

/**
 * Delete a blog API by ID
 * @param {mongoose.Schema.Types.ObjectId} blogApiId - The blog API ID
 * @returns {Promise<BlogApi>}
 */
const deleteBlogApiById = async (blogApiId) => {
  return BlogApi.findByIdAndDelete(blogApiId);
};

/**
 * Update a blog API by ID
 * @param {mongoose.Schema.Types.ObjectId} blogApiId - The blog API ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<BlogApi>}
 */
const updateBlogApiById = async (blogApiId, updateData) => {
  return BlogApi.findByIdAndUpdate(blogApiId, updateData, { new: true });
};

module.exports = {
  createBlogApi,
  getBlogApiById,
  getBlogApiByCompanyId,
  deleteBlogApiById,
  updateBlogApiById,
};
