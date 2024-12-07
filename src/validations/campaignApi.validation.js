const Joi = require('joi');

const createCampaignApi = {
  body: Joi.object().keys({
    name: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name should be at least 3 characters',
      'string.max': 'Name should not exceed 100 characters',
    }),
  }),
};

const updateCampaignApi = {
  body: Joi.object().keys({
    name: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name should be at least 3 characters',
      'string.max': 'Name should not exceed 100 characters',
    }),
  }),
};

module.exports = {
  createCampaignApi,
  updateCampaignApi,
};
