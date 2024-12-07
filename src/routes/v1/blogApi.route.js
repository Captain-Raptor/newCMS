const express = require('express');
const validate = require('../../middlewares/validate');
const blogApiController = require('../../controllers/blogApi.controller');
const blogApiValidation = require('../../validations/blogApi.validation'); // Import the validation schema

const router = express.Router();

router.post('/blogApiCreation', validate(blogApiValidation.createBlogApi), blogApiController.createBlogApi);
router.get('/getBlogApi', blogApiController.getBlogApi);
router.delete('/deleteBlogApi/:id', blogApiController.deleteBlogApi);
router.patch('/updateBlogApi/:id', validate(blogApiValidation.updateBlogApi), blogApiController.updateBlogApi);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: BlogApi
 *   description: Blog API management
 */

/**
 * @swagger
 * /blogs/blogApiCreation:
 *   post:
 *     summary: Create a new Blog API
 *     tags: [BlogApi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the Blog API
 *               description:
 *                 type: string
 *                 description: A brief description of the Blog API
 *             example:
 *               name: My Blog API
 *               description: This API manages my blog posts.
 *     responses:
 *       "201":
 *         description: Blog API created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog API created successfully
 */

/**
 * @swagger
 * /blogs/getBlogApi:
 *   get:
 *     summary: Retrieve all Blog APIs
 *     tags: [BlogApi]
 *     responses:
 *       "200":
 *         description: Successfully retrieved list of Blog APIs
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
 *               example:
 *                 - id: 605c72d72f1a2c6c58b45678
 *                   name: My Blog API
 *                   description: This API manages my blog posts.
 */

/**
 * @swagger
 * /blogs/deleteBlogApi/{id}:
 *   delete:
 *     summary: Delete a Blog API by ID
 *     tags: [BlogApi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Blog API to delete
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Blog API deleted successfully
 *       "404":
 *         description: Blog API not found
 */

/**
 * @swagger
 * /blogs/updateBlogApi/{id}:
 *   patch:
 *     summary: Update an existing Blog API
 *     tags: [BlogApi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Blog API to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the Blog API
 *               description:
 *                 type: string
 *                 description: The updated description of the Blog API
 *             example:
 *               name: Updated Blog API
 *               description: This API now includes additional features.
 *     responses:
 *       "200":
 *         description: Blog API updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog API updated successfully
 *       "404":
 *         description: Blog API not found
 */
