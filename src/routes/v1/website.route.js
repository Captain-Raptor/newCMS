const express = require('express');
const router = express.Router();
const { 
  createWebsite, 
  getWebsites, 
  deleteWebsite, 
  updateWebsite, 
  getWebsiteById 
} = require('../../controllers/webiste.controller');
const validate = require('../../middlewares/validate');
const { createWebsiteValidation, updateWebsiteValidation } = require('../../validations/website.validation');

// Route to create a new Website
router.post(
  '/',
  validate(createWebsiteValidation),
  createWebsite
);

// Route to get all Websites for a user's company
router.get('/', getWebsites);

// Route to get a specific Website by ID
router.get(
  '/:id',
  getWebsiteById
);

// Route to update a specific Website by ID
router.patch(
  '/:id',
  validate(updateWebsiteValidation),
  updateWebsite
);

// Route to delete a specific Website by ID
router.delete(
  '/:id',
  deleteWebsite
);

module.exports = router;
