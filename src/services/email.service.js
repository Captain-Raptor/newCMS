const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../config/logger');

// Function to load HTML email template
const loadEmailTemplate = (filePath) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
};

// Define the transport
const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

// Function to send email with HTML content
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

// Send reset password email by loading HTML template
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.domainUrl}/reset-password?token=${token}`;

  // Load the reset password email HTML template
  let html = loadEmailTemplate('../templates/resetPasswordEmail.html');
  // Replace placeholder with actual URL
  html = html.replace('{{resetPasswordUrl}}', resetPasswordUrl);

  await sendEmail(to, subject, html);
};

// Send verification email by loading HTML template
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.domainUrl}/verify-email?token=${token}`;

  // Load the verification email HTML template
  let html = loadEmailTemplate('../templates/verificationEmail.html');
  // Replace placeholder with actual URL
  html = html.replace('{{verificationEmailUrl}}', verificationEmailUrl);

  await sendEmail(to, subject, html);
};

// Send an email with HTML content and a PDF attachment
const sendContactEmail = async (to, name, phone, type, message, brochurePath) => {
  const subject = `Brochure for ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const html = `
    <h1>Thank you for your interest in our ${type} services</h1>
    <p>Dear ${name},</p>
    <p>We have received your message:</p>
    <p><strong>${message}</strong></p>
    <p>We have attached the brochure for your selected service type: ${type}.</p>
    <p>Feel free to contact us at ${phone} for more information.</p>
    <p>Best regards,</p>
    <p>Your Company</p>
  `;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const brochureContent = fs.readFileSync(brochurePath);

  const attachments = [
    {
      filename: `${type}_brochure.pdf`,
      content: brochureContent,
    },
  ];

  const msg = { from: config.email.from, to, subject, html, attachments };
  await transport.sendMail(msg);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendContactEmail,
};
