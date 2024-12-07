const express = require('express');
const validate = require('../../middlewares/validate');
const eventController = require('../../controllers/eventApi.controller');
const eventValidation = require('../../validations/eventApi.validation');

const router = express.Router();

router.post('/eventApiCreation', validate(eventValidation), eventController.createEvent);
// Update event by ID
router.patch('/eventApiUpdation/:id', validate(eventValidation.validateEventUpdate), eventController.updateEventById);
// Get events by company ID
router.get('/getEventApi', eventController.getEventsByCompanyId);

// Delete event by ID
router.delete('/deleteEventApi/:id', eventController.deleteEventById);

module.exports = router;

/**
 * @swagger
 * /eventApiCreation:
 *   post:
 *     summary: Create an event API
 *     description: Create a new event API for the company.
 *     tags:
 *       - Event API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the event
 *                 example: "Tech Conference"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the event
 *                 example: "2024-10-10T10:00:00Z"
 *               location:
 *                 type: string
 *                 description: Location of the event
 *                 example: "Tech Park, San Francisco"
 *               description:
 *                 type: string
 *                 description: Brief description of the event
 *                 example: "An annual tech conference with speakers from top companies."
 *     responses:
 *       201:
 *         description: Event API created successfully
 *       400:
 *         description: Bad Request - Validation failed
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /eventApiUpdation/{id}:
 *   patch:
 *     summary: Update an event API by ID
 *     description: Update an existing event API using the event ID.
 *     tags:
 *       - Event API
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event API ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the event
 *                 example: "Updated Tech Conference"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Updated date and time of the event
 *                 example: "2024-12-12T10:00:00Z"
 *               location:
 *                 type: string
 *                 description: Updated location of the event
 *                 example: "Updated Venue, San Francisco"
 *               description:
 *                 type: string
 *                 description: Updated description of the event
 *                 example: "A tech conference with new speakers."
 *     responses:
 *       200:
 *         description: Event API updated successfully
 *       400:
 *         description: Bad Request - Validation failed
 *       404:
 *         description: Event API not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /getEventApi:
 *   get:
 *     summary: Get event APIs by company ID
 *     description: Retrieve all event APIs associated with the company ID.
 *     tags:
 *       - Event API
 *     responses:
 *       200:
 *         description: A list of event APIs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Event API ID
 *                   name:
 *                     type: string
 *                     description: Event name
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Event date and time
 *                   location:
 *                     type: string
 *                     description: Event location
 *                   description:
 *                     type: string
 *                     description: Event description
 *       404:
 *         description: No events found for the given company ID
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /deleteEventApi/{id}:
 *   delete:
 *     summary: Delete an event API by ID
 *     description: Delete an event API using the event ID.
 *     tags:
 *       - Event API
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event API ID
 *     responses:
 *       204:
 *         description: Event API deleted successfully
 *       404:
 *         description: Event API not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * tags:
 *   - name: Event API
 *     description: Event API management
 */
