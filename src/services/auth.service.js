// auth.service.js
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const tokenService = require('./token.service');
const userService = require('./user.service');
const emailService = require('./email.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.isEmailVerified) {
    // await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });

    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(user.email, verifyEmailToken);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please verify your account. A new verification email has been sent.');
  }

  // Check for companyId
  if (!user.companyId) {
    // Generate self-company register token
    const selfCompanyRegisterToken = await tokenService.generateSelfCompanyRegisterToken(user);
    return {
      user,
      selfCompanyRegisterToken,
    };
  }

  // Proceed to generate access tokens if companyId exists
  const tokens = await tokenService.generateAuthTokens(user);

  // Remove any existing self-register tokens and verify email token of that user before saving the new access token
  await Token.deleteMany({ user: user.id, type: tokenTypes.SELF_COMPANY_REGISTER });
  await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });

  return {
    user,
    tokens,
  };
};
/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (token, accessToken, refreshToken) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const tokenPayload = jwt.decode(token);

  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const accessTokenDoc = await tokenService.verifyToken(accessToken, tokenTypes.ACCESS);
  const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);

  if (
    accessTokenDoc.user.toString() !== tokenPayload.sub.toString() ||
    refreshTokenDoc.user.toString() !== tokenPayload.sub.toString()
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token user IDs do not match');
  }

  await accessTokenDoc.remove();
  await refreshTokenDoc.remove();
  await tokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({
      user: user.id,
      type: { $in: [tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD] },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email using token
 * @param {string} token
 * @returns {Promise<User>}
 */
const verifyEmail = async (userId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.isEmailVerified = true;
  await user.save();
};
/**
 * Remove tokens from the database
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const removeTokens = async (accessToken, refreshToken) => {
  // Verify and remove access token
  const accessTokenDoc = await tokenService.verifyToken(accessToken, tokenTypes.ACCESS);
  if (accessTokenDoc) {
    await accessTokenDoc.remove();
  }

  // Verify and remove refresh token
  const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  if (refreshTokenDoc) {
    await refreshTokenDoc.remove();
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  removeTokens,
  verifyEmail,
};
