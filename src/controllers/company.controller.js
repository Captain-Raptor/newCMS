const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { companyService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');

/**
 * Create a company
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createCompany = catchAsync(async (req, res) => {
  // Extract the token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'selfCompanyRegister');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'selfCompanyRegister') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  const user = await User.findById(userId);

  if (!user || user.role !== 'CMS_ADMIN_USER') {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required role to create a company');
  }

  // Check if the user already has a company
  if (user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has a company');
  }

  // Create the company with createdBy, updatedBy, and cmsAdminUser fields
  const company = await companyService.createCompany({
    ...req.body,
   
    createdBy: user._id,
    updatedBy: user._id,
    cmsAdminUser: user._id, // Adding cmsAdminUser field
  });

  // Update the user document with the company ID
  user.companyId = company._id;
  user.isCompanyRegistered = true,
  await user.save();

  res.status(httpStatus.CREATED).send(company);
});

module.exports = {
  createCompany,
};
