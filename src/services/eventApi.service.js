const EventApi = require('../models/eventApi.model');

/**
 * Create an event
 * @param {Object} eventData - The event data
 * @returns {Promise<EventApi>}
 */
const createEvent = async (eventData) => {
  const event = new EventApi(eventData);
  await event.save();
  return event;
};

/**
 * Get an event by ID
 * @param {mongoose.Schema.Types.ObjectId} eventId - The event ID
 * @returns {Promise<EventApi>}
 */
const getEventById = async (eventId) => {
  return EventApi.findById(eventId);
};

/**
 * Update an event by ID
 * @param {mongoose.Schema.Types.ObjectId} eventId - The event ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<EventApi>}
 */
const updateEventById = async (eventId, updateData) => {
  return EventApi.findByIdAndUpdate(eventId, updateData, { new: true });
};

/**
 * Delete an event by ID
 * @param {mongoose.Schema.Types.ObjectId} eventId - The event ID
 * @returns {Promise<EventApi>}
 */
const deleteEventById = async (eventId) => {
  return EventApi.findByIdAndDelete(eventId);
};

/**
 * Get events by company ID
 * @param {mongoose.Schema.Types.ObjectId} companyId - The company ID
 * @returns {Promise<EventApi[]>}
 */
const getEventsByCompanyId = async (companyId) => {
  return EventApi.find({ companyID: companyId });
};

module.exports = {
  createEvent,
  getEventById,
  updateEventById,
  deleteEventById,
  getEventsByCompanyId,
};
