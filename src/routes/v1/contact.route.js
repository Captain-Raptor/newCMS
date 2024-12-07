const express = require('express');
const validate = require('../../middlewares/validate');
const contactController = require('../../controllers/contact.controller');
const contactValidation = require('../../validations/contact.validation');

const router = express.Router();

router.post('/submit', validate(contactValidation.submit), contactController.submitContactForm);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact Form
 */

/**
 * @swagger
 * /contact/submit:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - type
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [commercial, residential, hospitality]
 *               message:
 *                 type: string
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *               phone: 1234567890
 *               type: commercial
 *               message: I am interested in commercial services.
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */
