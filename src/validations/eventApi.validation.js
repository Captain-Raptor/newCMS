const Joi = require('joi');

// Define allowed file formats
const allowedFileFormats = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];

// Validation for a single field
const fieldSchema = Joi.object({
  label: Joi.string().required(),
  type: Joi.string().valid('string', 'options', 'file').required(),
  name: Joi.string().required(),
  required: Joi.boolean(),
  max_characters: Joi.number().integer().min(1),
  options: Joi.array().items(Joi.string()).when('type', { is: 'options', then: Joi.required() }),
  min_options: Joi.number().integer().min(0).when('type', { is: 'options', then: Joi.optional() }),
  max_options: Joi.number().integer().min(0).when('type', { is: 'options', then: Joi.optional() }),
  allowed_formats: Joi.array()
    .items(Joi.string().valid(...allowedFileFormats))
    .when('type', { is: 'file', then: Joi.required() }),
  max_file_size: Joi.number().integer().min(0).when('type', { is: 'file', then: Joi.required() }),
});

// Validation for the entire event
const eventSchema = Joi.object({
  event_name: Joi.string().required(),
  fields: Joi.array().items(fieldSchema).required(),
});

// Validation function
const validateEvent = (eventData) => {
  return eventSchema.validate(eventData);
};

module.exports = validateEvent;
