// blog.route.js
const express = require('express');
const multer = require('multer');
const validate = require('../../middlewares/validate');
const blogController = require('../../controllers/blog.controller');
const blogValidation = require('../../validations/blog.validation');

const upload = multer();

const router = express.Router();

router.post(
  '/blogCreation/:blogApiId',
  upload.any(),
  validate(blogValidation.validateBlogCreation),
  blogController.createBlog
);
router.patch('/blogUpdate/:blogId', upload.any(), validate(blogValidation.validateBlogUpdate), blogController.updateBlog);
router.delete('/blogDelete/:blogId', blogController.deleteBlog);
router.get('/getBlog/:blogId', blogController.getBlogById);
router.get('/getBlogList/:blogApiId', blogController.getBlogByblogApiId);
module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog management
 */

/**
 * @swagger
 * /blogs/blogCreation/{blogApiId}:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogApiId
 *         required: true
 *         description: The ID of the blog API associated with the post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - heading
 *               - subheading
 *               - bodyContent
 *               - bannerImage
 *               - thumbnailImage
 *             properties:
 *               heading:
 *                 type: string
 *                 description: The heading of the blog post
 *               subheading:
 *                 type: string
 *                 description: The subheading of the blog post
 *               bodyContent:
 *                 type: string
 *                 description: The main content of the blog post
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file (jpg, jpeg, png, max 2MB)
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file (jpg, jpeg, png, max 2MB)
 *             example:
 *               heading: Blog Post Title
 *               subheading: A brief subheading for the blog post
 *               bodyContent: This is the content of the blog post.
 *     responses:
 *       "200":
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog post created successfully
 */

/**
 * @swagger
 * /blogs/blogUpdate/{blogId}:
 *   patch:
 *     summary: Update an existing blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: The ID of the blog post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               heading:
 *                 type: string
 *                 description: The updated heading of the blog post
 *               subheading:
 *                 type: string
 *                 description: The updated subheading of the blog post
 *               bodyContent:
 *                 type: string
 *                 description: The updated main content of the blog post
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *                 description: Updated banner image file (jpg, jpeg, png, max 2MB)
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *                 description: Updated thumbnail image file (jpg, jpeg, png, max 2MB)
 *             example:
 *               heading: Updated Blog Post Title
 *               subheading: Updated brief subheading
 *               bodyContent: This is the updated content of the blog post.
 *     responses:
 *       "200":
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog post updated successfully
 */

/**
 * @swagger
 * /blogs/blogDelete/{blogId}:
 *   delete:
 *     summary: Delete a blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: The ID of the blog post to delete
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Blog post deleted successfully
 *       "404":
 *         description: Blog post not found
 */

/**
 * @swagger
 * /blogs/getBlog/{blogId}:
 *   get:
 *     summary: Retrieve a blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: The ID of the blog post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully retrieved the blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 heading:
 *                   type: string
 *                 subheading:
 *                   type: string
 *                 bodyContent:
 *                   type: string
 *                 bannerImage:
 *                   type: string
 *                   description: URL to the banner image
 *                 thumbnailImage:
 *                   type: string
 *                   description: URL to the thumbnail image
 *               example:
 *                 id: 605c72d72f1a2c6c58b45678
 *                 heading: Blog Post Title
 *                 subheading: A brief subheading for the blog post
 *                 bodyContent: This is the content of the blog post.
 *                 bannerImage: http://example.com/banner.jpg
 *                 thumbnailImage: http://example.com/thumbnail.jpg
 */

/**
 * @swagger
 * /blogs/getBlogList/{blogApiId}:
 *   get:
 *     summary: Retrieve a list of blog posts by Blog API ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogApiId
 *         required: true
 *         description: The ID of the Blog API to retrieve the blog posts from
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully retrieved list of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   heading:
 *                     type: string
 *                   subheading:
 *                     type: string
 *                   bodyContent:
 *                     type: string
 *                   bannerImage:
 *                     type: string
 *                     description: URL to the banner image
 *                   thumbnailImage:
 *                     type: string
 *                     description: URL to the thumbnail image
 *               example:
 *                 - id: 605c72d72f1a2c6c58b45678
 *                   heading: Blog Post Title
 *                   subheading: A brief subheading for the blog post
 *                   bodyContent: This is the content of the blog post.
 *                   bannerImage: http://example.com/banner.jpg
 *                   thumbnailImage: http://example.com/thumbnail.jpg
 */
