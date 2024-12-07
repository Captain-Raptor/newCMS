// Company.route.js
const express = require('express');
const validate = require('../../middlewares/validate');
const companyController = require('../../controllers/company.controller');
const companyValidation = require('../../validations/company.validation');

const router = express.Router();

router.post('/self-company-register', validate(companyValidation.createCompany), companyController.createCompany);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company API management
 */

/**
 * @swagger
 * /self-company-register:
 *   post:
 *     summary: Register a company
 *     description: Register a new company using the self-registration process.
 *     tags:
 *       - Company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the company
 *                 example: "Tech Corp"
 *               address:
 *                 type: string
 *                 description: Address of the company
 *                 example: "123 Tech Street"
 *               email:
 *                 type: string
 *                 description: Company email address
 *                 example: "info@techcorp.com"
 *               phoneNumber:
 *                 type: string
 *                 description: Company phone number
 *                 example: "+1-555-555-5555"
 *     responses:
 *       201:
 *         description: Company successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Validation failed
 *       500:
 *         description: Internal Server Error
 */
