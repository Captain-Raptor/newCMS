// user.service.js
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const PERMISSIONS = require('../config/permissions');

/**
 * Create a user
 * @param {Object} userBody - The user data
 * @returns {Promise<User>} - The created user
 */
const createCmsAdminUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Ensure the role is set to 'CMS_ADMIN_USER' and not provided by user input
  if (userBody.role && userBody.role !== 'CMS_ADMIN_USER') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
  }

  // Create user with default permissions for CMS_ADMIN_USER
  return User.create({
    ...userBody,
    role: 'CMS_ADMIN_USER',
    permissions: [
      'viewDashboard',
      'addUser',
      'getUsers',
      'editUser',
      'deleteUser',
      'createBlog',
      'getBlog',
      'editBlog',
      'deleteBlog',
      'createBlogApi',
      'editBlogApi',
      'getBlogApi',
      'deleteBlogApi',
      'addEvent',
      'getEvent',
      'editEvent',
      'deleteEvent',
      'createEventApi',
      'updateEventApi',
      'getEventApi',
      'deleteEventApi',
      'createCampaignApi',
      'getCampaignApi',
      'deleteCampaignApi',
      'editCampaignApi',
      'uploadCampaign',
      'exportCampaign',
      'getCampaign',
      'deleteCampaign',
    ],
  });
};

/**
 * Create a CMS Sub User
 * @param {Object} userBody - The user data
 * @param {string} token - JWT token to verify
 * @returns {Promise<User>}
 */
const createCmsSubUser = async (userBody, token) => {
  // Decode token and verify if it's valid
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  // Check if the token type is 'access' and user has 'addUser' permission
  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  // Fetch the user who is creating the sub-user
  const creatorUser = await User.findById(decodedToken.sub);
  if (!creatorUser || !creatorUser.permissions.includes('addUser')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to add users');
  }

  // Check if the email is already taken
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Validate permissions if provided
  if (userBody.permissions) {
    const invalidPermissions = userBody.permissions.filter((permission) => !PERMISSIONS.includes(permission));
    if (invalidPermissions.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  // Create the sub-user with the same company ID as the creator and optional permissions
  const newUser = {
    ...userBody,
    role: 'CMS_SUB_USER',
    companyId: creatorUser.companyId,
    createdBy: creatorUser._id,
    updatedBy: creatorUser._id,
  };

  return User.create(newUser);
};
/**
 * Update a CMS sub-user
 * @param {ObjectId} userId - The user's ID
 * @param {Object} updateBody - Fields to update
 * @param {string} token - JWT token to verify
 * @returns {Promise<User>}
 */
const updateCmsSubUser = async (userId, updateBody, token) => {
  // Decode and verify the token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  // Fetch the user who is performing the update
  const updaterUser = await User.findById(decodedToken.sub);
  if (!updaterUser || !updaterUser.permissions.includes('editUser')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to edit users');
  }

  // Fetch the user to update
  // eslint-disable-next-line no-use-before-define
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the user being updated is an CMS_ADMIN_USER
  if (user.role === 'CMS_ADMIN_USER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot update CMS_ADMIN_USER roles');
  }

  // Check if updater and updatee have the same companyId
  if (!updaterUser.companyId.equals(user.companyId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only update users within your company');
  }

  // Validate permissions if provided
  if (updateBody.permissions) {
    const invalidPermissions = updateBody.permissions.filter((permission) => !PERMISSIONS.includes(permission));
    if (invalidPermissions.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  // Update user fields
  Object.assign(user, updateBody);
  user.updatedBy = updaterUser._id;
  await user.save();

  return user;
};

/**
 * Query for users
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>} - Paginated user results
 */
const queryUsers = async (filter, options) => {
  return User.paginate(filter, options);
};

/**
 * Get user by id
 * @param {ObjectId} id - The user's ID
 * @returns {Promise<User>} - The user
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email - The user's email
 * @returns {Promise<User>} - The user
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId - The user's ID
 * @param {Object} updateBody - Fields to update
 * @returns {Promise<User>} - The updated user
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId - The user's ID
 * @returns {Promise<User>} - The deleted user
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Delete a CMS sub-user
 * @param {ObjectId} userId - The user's ID
 * @param {string} token - JWT token to verify
 * @returns {Promise<void>}
 */
const deleteCmsSubUser = async (userId, token) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  // Fetch the user who is performing the deletion
  const deleterUser = await User.findById(decodedToken.sub);
  if (!deleterUser || !deleterUser.permissions.includes('deleteUser')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete users');
  }

  // Fetch the user to delete
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the user being deleted is an CMS_ADMIN_USER
  if (user.role === 'CMS_ADMIN_USER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot delete CMS_ADMIN_USER roles');
  }

  // Ensure the user belongs to the same company
  if (!deleterUser.companyId.equals(user.companyId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete users within your company');
  }

  await user.remove();
};

module.exports = {
  createCmsAdminUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  createCmsSubUser,
  updateCmsSubUser,
  deleteCmsSubUser,
};
