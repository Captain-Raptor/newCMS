// company.validation.js
const Joi = require('joi');

const createCompany = {
  body: Joi.object().keys({
    name: Joi.string().required().description('Company name'),
    email: Joi.string().email().required().description('Company email'),
    taxId: Joi.string().required().description('Company tax ID'),
    address: Joi.string().required().description('Company address'),
    country: Joi.string().required().description('Country'),
    state: Joi.string().required().description('State'),
    city: Joi.string().required().description('City'),
    pincode: Joi.string().required().description('Pincode'),
  }),
};

module.exports = {
  createCompany,
};
