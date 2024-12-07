const httpStatus = require('http-status');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const { sendContactEmail } = require('../services/email.service');
const Contact = require('../models/contact.model');

const submitContactForm = catchAsync(async (req, res) => {
  const { name, email, phone, type, message } = req.body;

  let brochurePath = '';
  if (type === 'commercial') {
    brochurePath = path.join(__dirname, '../docs/brochures/commercial.pdf');
  } else if (type === 'residential') {
    brochurePath = path.join(__dirname, '../docs/brochures/residential.pdf');
  } else if (type === 'hospitality') {
    brochurePath = path.join(__dirname, '../docs/brochures/hospitality.pdf');
  }

  // Send email with the brochure attachment
  await sendContactEmail(email, name, phone, type, message, brochurePath);

  // Create a new contact form entry
  const contactData = new Contact({
    name,
    email,
    phone,
    type,
    message,
  });

  // Save the contact form entry to the database
  await contactData.save();

  // Return a success response
  res.status(httpStatus.OK).send({ status: 'success' });
});

module.exports = {
  submitContactForm,
};
