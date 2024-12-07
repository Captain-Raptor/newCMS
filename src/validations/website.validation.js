const Joi = require('joi');

// Validation for Social Media Links
const socialMediaSchema = Joi.object().keys({
  platform: Joi.string().required().messages({
    'string.empty': 'Social media platform name is required',
  }),
  url: Joi.string().uri().required().messages({
    'string.empty': 'Social media URL is required',
    'string.uri': 'Social media URL must be a valid URL',
  }),
});

// Essentials Schema Validation
const essentialsSchema = Joi.object().keys({
  logo: Joi.string().uri().required().messages({
    'string.empty': 'Logo URL is required',
    'string.uri': 'Logo must be a valid URL',
  }),
  mobileLogo: Joi.string().uri().optional(),
  favicon: Joi.string().uri().optional(),
  socialMedias: Joi.array().items(socialMediaSchema).optional(),
});

// SEO Schema Validation
const seoSchema = Joi.object().keys({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(255).required(),
  keywords: Joi.string().max(255).required(),
  author: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  imageAlt: Joi.string().optional(),
  appleTouchIcon: Joi.string().uri().optional(),
});

// Content Types Validation (Text, Image, Video)
const textContentSchema = Joi.object().keys({
  text: Joi.string().required(),
  size: Joi.string().valid('small', 'medium', 'large').optional(),
  type: Joi.string().valid('title', 'subtitle', 'normaltext').optional(),
});

const imageContentSchema = Joi.object().keys({
  url: Joi.string().uri().required(),
  alt: Joi.string().optional(),
});

const videoContentSchema = Joi.object().keys({
  url: Joi.string().uri().required(),
  alt: Joi.string().optional(),
});

// Data Items Validation
const dataSchema = Joi.object().keys({
  key: Joi.string().required(),
  type: Joi.string().valid('text', 'array_of_text', 'image', 'array_of_images', 'video', 'array_of_videos').required(),
  value: Joi.alternatives().conditional('type', {
    switch: [
      { is: 'text', then: textContentSchema },
      { is: 'array_of_text', then: Joi.array().items(textContentSchema) },
      { is: 'image', then: imageContentSchema },
      { is: 'array_of_images', then: Joi.array().items(imageContentSchema) },
      { is: 'video', then: videoContentSchema },
      { is: 'array_of_videos', then: Joi.array().items(videoContentSchema) },
    ],
  }),
});

// Section Schema Validation
const sectionSchema = Joi.object().keys({
  name: Joi.string().required(),
  data: Joi.array().items(dataSchema).optional(),
});

// Page Schema Validation
const pageSchema = Joi.object().keys({
  name: Joi.string().required(),
  sections: Joi.array().items(sectionSchema).optional(),
});

// Main Website Validation Schema
const createWebsite = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    essentials: essentialsSchema.required(),
    seo: seoSchema.required(),
    pageData: Joi.array().items(pageSchema).optional(),
    companyId: Joi.string().required(),
    createdBy: Joi.string().required(),
  }),
};

const updateWebsite = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    essentials: essentialsSchema.optional(),
    seo: seoSchema.optional(),
    pageData: Joi.array().items(pageSchema).optional(),
    updatedBy: Joi.string().required(),
  }),
};

module.exports = {
  createWebsite,
  updateWebsite,
};
