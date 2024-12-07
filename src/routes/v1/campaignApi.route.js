const express = require('express');
const validate = require('../../middlewares/validate');
const campaignApiController = require('../../controllers/campaignApi.controller');
const campaignApiValidation = require('../../validations/campaignApi.validation'); // Import the validation schema

const router = express.Router();

router.post(
  '/campaignApiCreation',
  validate(campaignApiValidation.createCampaignApi),
  campaignApiController.createCampaignApi
);
router.get('/getCampaignApi', campaignApiController.getCampaignApi);
router.delete('/deleteCampaignApi/:id', campaignApiController.deleteCampaignApi);
router.patch(
  '/updateCampaignApi/:id',
  validate(campaignApiValidation.updateCampaignApi),
  campaignApiController.updateCampaignApi
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Campaign API
 *   description: Campaign API management
 */

/**
 * @swagger
 * /campaigns/campaignUpload/{campaignApiId}:
 *   post:
 *     summary: Upload a new campaign
 *     tags: [Campaign API]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the Campaign API to upload
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignName:
 *                 type: string
 *                 description: The name of the campaign
 *               campaignData:
 *                 type: object
 *                 description: The campaign data object
 *             example:
 *               campaignName: "New Campaign"
 *               campaignData: { key: "value" }
 *     responses:
 *       "200":
 *         description: Campaign uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign uploaded successfully
 */

/**
 * @swagger
 * /campaigns/exportcsvCampaign/{campaignApiId}:
 *   get:
 *     summary: Export campaign data as CSV
 *     tags: [Campaign API]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the Campaign API
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: CSV export successful
 *         content:
 *           application/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       "404":
 *         description: Campaign API not found
 */

/**
 * @swagger
 * /campaigns/getcampaign/{campaignApiId}:
 *   get:
 *     summary: Get campaigns with pagination
 *     tags: [Campaign API]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the Campaign API
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   createdBy:
 *                     type: string
 *                   companyID:
 *                     type: string
 *               example:
 *                 - id: "123"
 *                   name: "Campaign 1"
 *                   createdBy: "User 1"
 *                   companyID: "Company 1"
 *       "404":
 *         description: Campaign API not found
 */

/**
 * @swagger
 * /campaigns/openedcampaign/{campaignId}:
 *   post:
 *     summary: Mark a campaign as opened
 *     tags: [Campaign API]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Campaign marked as opened
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign opened successfully
 *       "404":
 *         description: Campaign not found
 */

/**
 * @swagger
 * /campaigns/deletecampaign/{campaignId}:
 *   delete:
 *     summary: Delete a campaign by ID
 *     tags: [Campaign API]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Campaign deleted successfully
 *       "404":
 *         description: Campaign not found
 */
