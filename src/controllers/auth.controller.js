// auth.controller.js
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { extractToken } = require('../utils/authUtils');
const { Token } = require('../models');

const register = catchAsync(async (req, res) => {
  const user = await userService.createCmsAdminUser(req.body);
  // const tokens = await tokenService.generateAuthTokens(user);
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

  // Generate self-company register token
  const selfCompanyRegisterToken = await tokenService.generateSelfCompanyRegisterToken(user);

  await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  res.status(httpStatus.CREATED).send({
    user,
    // tokens,
    selfCompanyRegisterToken,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, selfCompanyRegisterToken, tokens } = await authService.loginUserWithEmailAndPassword(email, password);

  if (selfCompanyRegisterToken) {
    return res.send({ user, selfCompanyRegisterToken });
  }

  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  // Extract token from Authorization header
  console.log(req.body)
  const token = extractToken(req.headers.authorization);
  const { accessToken, refreshToken } = req.body;

  // Verify the main access token
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const tokenPayload = jwt.decode(token);

  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  // Verify the access token and refresh token
  const accessTokenDoc = await tokenService.verifyToken(accessToken, tokenTypes.ACCESS);
  const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);

  // Ensure all tokens belong to the same user
  if (
    accessTokenDoc.user.toString() !== tokenPayload.sub.toString() ||
    refreshTokenDoc.user.toString() !== tokenPayload.sub.toString()
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token user IDs do not match');
  }

  // Remove the tokens from the database
  await accessTokenDoc.remove();
  await refreshTokenDoc.remove();
  await tokenDoc.remove();

  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const token = extractToken(req.headers.authorization); // Extract token from Authorization header
  await authService.resetPassword(token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});
const verifyEmail = catchAsync(async (req, res) => {
  const token = req.query.token; // Get token from the query parameter

  // Verify the token
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.VERIFY_EMAIL);

  // Find the user by ID from the token payload
  const user = await userService.getUserById(tokenDoc.user);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Update the user's email verification status
  user.isEmailVerified = true;
  await user.save();
  await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
  res.status(httpStatus.OK).send({ message: 'Email verified successfully' });
});


module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
