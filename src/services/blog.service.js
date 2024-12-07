const Blog = require('../models/blog.model');

const createBlog = async (blogData) => {
  const blog = await Blog.create(blogData);
  return blog;
};

const updateBlog = async (blogId, blogData) => {
  const updatedBlog = await Blog.findByIdAndUpdate(blogId, blogData, { new: true });
  return updatedBlog;
};
const getBlogById = async (blogId) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error('Blog not found');
  }
  return blog;
};

const deleteBlog = async (blogId) => {
  await Blog.findByIdAndDelete(blogId);
};

const getBlogsByBlogApiId = async (blogApiId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  const blogs = await Blog.find({ blogApiId }).skip(skip).limit(limit).exec();

  const total = await Blog.countDocuments({ blogApiId }).exec(); // Get total count for pagination
  return { blogs, total }; // Return both blogs and total count
};
module.exports = {
  createBlog,
  updateBlog,
  getBlogById,
  deleteBlog,
  getBlogsByBlogApiId,
};
