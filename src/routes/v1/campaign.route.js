  const express = require('express');
  const validate = require('../../middlewares/validate');
  const campaignController = require('../../controllers/campaign.controller');
  const campaignValidation = require('../../validations/campaign.validation');

  const router = express.Router();

  // Existing route for uploading campaigns
  router.post(
    '/campaignUpload/:campaignApiId',
    validate(campaignValidation.uploadCampaign),
    campaignController.uploadCampaign
  );

  // New route for exporting campaigns as CSV
  router.get('/exportcsvCampaign/:campaignApiId', campaignController.exportCsvCampaign);

  // New route for getting campaigns with pagination
  router.get('/getcampaign/:campaignApiId', campaignController.getCampaigns);

  // New route for opening a campaign
  router.post('/openedcampaign/:campaignId', campaignController.openCampaign);
  router.delete('/deletecampaign/:campaignId', campaignController.deleteCampaign);

  module.exports = router;


  /**
 * @swagger
 * tags:
 *   name: Campaign
 *   description: Campaign management
 */

/**
 * @swagger
 * /campaignUpload/{campaignApiId}:
 *   post:
 *     summary: Upload a new campaign
 *     tags: [Campaign]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the campaign API
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - campaignFile
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the campaign
 *               description:
 *                 type: string
 *                 description: The description of the campaign
 *               campaignFile:
 *                 type: string
 *                 format: binary
 *                 description: Campaign file (pdf, docx, etc.)
 *             example:
 *               name: New Marketing Campaign
 *               description: A brief description of the campaign
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
 * /exportcsvCampaign/{campaignApiId}:
 *   get:
 *     summary: Export campaigns as CSV
 *     tags: [Campaign]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the campaign API
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Campaigns exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaigns exported successfully
 */

/**
 * @swagger
 * /getcampaign/{campaignApiId}:
 *   get:
 *     summary: Retrieve campaigns with pagination
 *     tags: [Campaign]
 *     parameters:
 *       - in: path
 *         name: campaignApiId
 *         required: true
 *         description: The ID of the campaign API
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully retrieved campaigns
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
 *                   description:
 *                     type: string
 *                 example:
 *                   id: 605c72d72f1a2c6c58b45678
 *                   name: Campaign 1
 *                   description: Campaign description
 */

/**
 * @swagger
 * /openedcampaign/{campaignId}:
 *   post:
 *     summary: Mark a campaign as opened
 *     tags: [Campaign]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Campaign opened successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign opened successfully
 */

/**
 * @swagger
 * /deletecampaign/{campaignId}:
 *   delete:
 *     summary: Delete a campaign by ID
 *     tags: [Campaign]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign to delete
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Campaign deleted successfully
 *       "404":
 *         description: Campaign not found
 */
