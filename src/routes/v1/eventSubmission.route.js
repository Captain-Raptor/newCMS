const express = require('express');
const multer = require('multer');
const validate = require('../../middlewares/validate');
const eventSubmissionController = require('../../controllers/eventSubmission.controller');
const validateEventSubmission = require('../../validations/eventSubmission.validation');

const upload = multer();

const router = express.Router();

router.post(
  '/submit/:eventId',
  upload.any(),
  validate(validateEventSubmission),
  eventSubmissionController.createEventSubmission
);
router.get('/getEventSubmission/:eventId', eventSubmissionController.getEventSubmissionByEventId); // eventId means Eventapi id

router.delete('/deleteEventSubmission/:eventSubmissionId', eventSubmissionController.deleteEventSubmission);

module.exports = router;




/**
 * @swagger
 * tags:
 *   - name: Event Submission API
 *     description: Event Submission API management
 */

/**
 * @swagger
 * /eventApiSubmission/{eventId}:
 *   post:
 *     tags: [Event Submission API]
 *     summary: Create an event submission
 *     description: Creates a new event submission for a given event.
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: The ID of the event for which to create a submission.
 *         schema:
 *           type: string
 *       - name: body
 *         in: body
 *         required: true
 *         description: Fields for the event submission.
 *         schema:
 *           type: object
 *           properties:
 *             fields:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   value:
 *                     type: string
 *                   # Add any other properties as needed based on your schema
 *     responses:
 *       201:
 *         description: Event submission created successfully
 *         schema:
 *           type: object
 *           properties:
 *             submission:
 *               type: object
 *               # Add properties based on the created submission structure
 *       400:
 *         description: Bad Request. Missing required fields or validation errors.
 *       404:
 *         description: Event not found.
 */

/**
 * @swagger
 * /eventApiSubmission/{eventId}:
 *   get:
 *     tags: [Event Submission API]
 *     summary: Get event submissions by event ID
 *     description: Retrieves submissions for a given event ID.
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: The ID of the event for which to retrieve submissions.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of submissions to retrieve per page.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved submissions.
 *         schema:
 *           type: object
 *           properties:
 *             submissions:
 *               type: array
 *               items:
 *                 type: object
 *                 # Add properties based on your submission structure
 *       400:
 *         description: Bad Request. Missing required fields or invalid parameters.
 *       404:
 *         description: Event not found.
 *       403:
 *         description: User does not have permission to access submissions.
 */

/**
 * @swagger
 * /eventApiSubmission/{eventSubmissionId}:
 *   delete:
 *     tags: [Event Submission API]
 *     summary: Delete an event submission
 *     description: Deletes a specific event submission by ID.
 *     parameters:
 *       - name: eventSubmissionId
 *         in: path
 *         required: true
 *         description: The ID of the event submission to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event submission deleted successfully
 *       400:
 *         description: Bad Request. Missing required fields.
 *       404:
 *         description: Event submission not found.
 *       403:
 *         description: User does not have permission to delete this submission.
 */
