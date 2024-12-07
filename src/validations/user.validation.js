const Joi = require('joi');
const PERMISSIONS = require('../config/permissions');
const { objectId } = require('../utils/objectId'); // Adjust the path as necessary

const createUser = {
  body: Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    permissions: Joi.array()
      .items(Joi.string().valid(...PERMISSIONS))
      .unique()
      .required(),
    profilePicture: Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg').required(),
      buffer: Joi.binary().required(),
      size: Joi.number()
        .max(2 * 1024 * 1024)
        .required(), // Max size for the profile picture (2 MB)
    }).optional(), // Make profile picture optional
  }).unknown(true),
};

const updateUser = {
  body: Joi.object({
    name: Joi.string().optional(),
    permissions: Joi.array()
      .items(Joi.string().valid(...PERMISSIONS))
      .unique() // Ensures no duplicate permissions
      .optional(),
    profilePicture: Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg').required(),
      buffer: Joi.binary().required(),
      size: Joi.number()
        .max(2 * 1024 * 1024)
        .required(), // Max size for the profile picture (2 MB)
    }).optional(), // Make profile picture optional
  }).unknown(true), // Allows extra form-data fields
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId), // Validates that userId is a valid MongoDB ObjectId
  }),
};

const getSubUsers = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(20).default(10), // Set max limit to 100
  }),
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getSubUsers,
};
