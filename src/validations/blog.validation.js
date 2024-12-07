const Joi = require('joi');

// Define file schema
const fileSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg').required(),
  buffer: Joi.binary().required(),
  size: Joi.number()
   
    .required(), // Max size for the banner image (2 MB)
});

// Define validation schema for blog creation
const validateBlogCreation = Joi.object({
  heading: Joi.string().required(),
  subheading: Joi.string().optional(),
  bodyContent: Joi.string().required(),
  bannerImage: fileSchema.required(), // Validate banner image fields
  thumbnailImage: fileSchema
    .tailor('thumbnailImage') // Tailor the schema for thumbnail image validation
    .max(1 * 1024 * 1024) // Max size for the thumbnail image (1 MB)
    .required(), // Validate thumbnail image fields
});

// Define validation schema for blog update
const validateBlogUpdate = Joi.object({
  heading: Joi.string().optional(),
  subheading: Joi.string().optional(),
  bodyContent: Joi.string().optional(),
  bannerImage: fileSchema.optional(), // Validate banner image fields
  thumbnailImage: fileSchema.optional(), // Validate thumbnail image fields
});

// Custom validation for thumbnail image
fileSchema.tailor('thumbnailImage').max(1 * 1024 * 1024); // Apply max size constraint for thumbnail images

module.exports = { validateBlogCreation, validateBlogUpdate };
