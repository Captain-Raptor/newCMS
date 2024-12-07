const Joi = require('joi');

const uploadCampaign = {
  params: Joi.object().keys({
    campaignApiId: Joi.string().required().messages({
      'string.empty': 'Campaign API ID is required',
    }),
  }),
  body: Joi.array()
    .items(
      Joi.object().keys({
        name: Joi.string().min(3).max(100).required().messages({
          'string.empty': 'Name is required',
          'string.min': 'Name should be at least 3 characters',
          'string.max': 'Name should not exceed 100 characters',
        }),
        type: Joi.string().valid('email', 'phone').required().messages({
          'string.empty': 'Type (email or phone) is required',
        }),
        value: Joi.string().required().messages({
          'string.empty': 'Email or phone number is required',
        }),
        link: Joi.string().uri().required().messages({
          'string.empty': 'Link is required',
          'string.uri': 'Link must be a valid URI',
        }),
      })
    )
    .required()
    .messages({
      'array.base': 'Request body should be an array of data',
    }),
};

module.exports = {
  uploadCampaign,
};
