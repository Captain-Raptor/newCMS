const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { eventService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');
const config = require('../config/config');
/**
 * Create an event
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createEvent = catchAsync(async (req, res) => {
  // Extract the token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User ID');
  }

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('createEventApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to create an event');
  }

  // Create the event with createdBy and updatedBy fields
  const event = await eventService.createEvent({
    ...req.body,
    companyID: user.companyId,
    createdBy: user._id,
    updatedBy: user._id,
  });

  res.status(httpStatus.CREATED).send({
    message: 'Event successfully created',
    api: `${config.apiBaseUrl}/events/submit/${event._id}`,
  });
});

/**
 * Update an event by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const updateEventById = catchAsync(async (req, res) => {
  const eventId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Event ID');
  }

  // Extract the token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('updateEventApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to update an event');
  }

  // Retrieve the event to check its companyID
  const event = await eventService.getEventById(eventId);

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Check if the user and the event belong to the same company
  if (user.companyId.toString() !== event.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the event');
  }

  // Update the event
  const updatedEvent = await eventService.updateEventById(eventId, {
    ...req.body,
    updatedBy: user._id,
  });

  res.status(httpStatus.OK).send(updatedEvent);
});

/**
 * Get events by company ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getEventsByCompanyId = catchAsync(async (req, res) => {
  // Extract the token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user has the permission to get events
  if (!user.permissions.includes('getEventApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to get events');
  }

  const companyID = user.companyId;

  if (!mongoose.Types.ObjectId.isValid(companyID)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Company ID');
  }

  // Get events by company ID
  const events = await eventService.getEventsByCompanyId(companyID);

  res.status(httpStatus.OK).send(events);
});
/**
 * Delete an event by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const deleteEventById = catchAsync(async (req, res) => {
  const eventId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Event ID');
  }

  // Extract the token from the authorization header
  const token = extractToken(req.headers.authorization);

  // Validate and decode the token
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;

  const user = await User.findById(userId);

  if (!user || !user.permissions.includes('deleteEventApi')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have the required permissions to delete an event');
  }

  // Retrieve the event to check its companyID
  const event = await eventService.getEventById(eventId);

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EventApi not found');
  }

  // Check if the user and the event belong to the same company
  if (user.companyId.toString() !== event.companyID.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to the same company as the event');
  }

  // Delete the event
  await eventService.deleteEventById(eventId);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createEvent,
  updateEventById,
  getEventsByCompanyId,
  deleteEventById,
};
