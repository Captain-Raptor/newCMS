const Joi = require('joi');

const submit = {
  body: Joi.object().keys({
    name: Joi.string()
      .max(100) // Maximum length for name
      .pattern(/^[a-zA-Z\s]+$/) // Allow only letters and spaces
      .required(),
    email: Joi.string()
      .email()
      .max(255) // Maximum length for email
      .required(),
    phone: Joi.string()
      .max(20)
      .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 phone number format (international format)
      .required(),
    type: Joi.string().valid('commercial', 'residential', 'hospitality').required(),
    message: Joi.string()
      .max(2000)
      .pattern(/^[\s\S]*$/) // Allows any character (including newlines)
      .required(),
  }),
};

module.exports = {
  submit,
};
