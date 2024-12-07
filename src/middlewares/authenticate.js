// middlewares/authenticate.js

const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { tokenService } = require('../services');
const { extractToken } = require('../utils/authUtils');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

// Middleware to authenticate user with specified token type
const authenticate = (tokenType) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req.headers.authorization);

      // Validate and decode the token
      const decodedToken = await tokenService.verifyToken(token, tokenType);
      if (!decodedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
      }

      if (decodedToken.type !== tokenType) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
      }

      const userId = decodedToken.user;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Attach user to request object for further use in routes
      req.user = user;

      next(); // Call the next middleware
    } catch (error) {
      next(error); // Pass the error to the error handler
    }
  };
};

module.exports = authenticate;
