// token.service.js
const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, permissions = [], secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    permissions, // Include permissions in the token payload
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

  // Get user's permissions
  const userPermissions = user.permissions || [];

  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS, userPermissions);
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH, userPermissions);

  await saveToken(accessToken, user.id, accessTokenExpires, tokenTypes.ACCESS);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateSelfCompanyRegisterToken = async (user) => {
  if (!user || !user.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required for token generation');
  }
  const expires = moment().add(config.jwt.selfCompanyRegisterExpirationMinutes, 'minutes');
  const token = generateToken(user.id, expires, tokenTypes.SELF_COMPANY_REGISTER);
  await Token.deleteMany({ user: user.id, type: tokenTypes.SELF_COMPANY_REGISTER });
  await saveToken(token, user.id, expires, tokenTypes.SELF_COMPANY_REGISTER);
  return { token, expires: expires.toDate() };
};

const removeOldTokens = async (userId, type) => {
  await Token.deleteMany({ user: userId, type, blacklisted: false });
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
const removeToken = async (tokenId) => {
  await Token.findByIdAndDelete(tokenId);
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateSelfCompanyRegisterToken,
  removeOldTokens,
  removeToken,
};
