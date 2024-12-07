const express = require('express');
const multer = require('multer');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

// Multer setup for form-data
const upload = multer();

const router = express.Router();
router.post(
  '/cms-sub-user',
  upload.single('profilePicture'),
  validate(userValidation.createUser),
  userController.createCmsSubUser
);

// router.post('/cms-sub-user', upload.none(), validate(userValidation.createUser), userController.createCmsSubUser);
router.patch(
  '/cms-sub-user/:userId',
  upload.single('profilePicture'),
  validate(userValidation.updateUser),
  userController.updateCmsSubUser
);

router.delete('/cms-sub-user/:userId', validate(userValidation.deleteUser), userController.deleteCmsSubUser);
router.get('/cms-sub-users', validate(userValidation.getSubUsers), userController.getCmsSubUsers);
router.get('/profile', userController.getProfileInfo);

module.exports = router;

/**
 * @swagger
 * /cms/sub-user:
 *   post:
 *     summary: Create a new CMS sub-user
 *     tags: [CMS Sub User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /cms/sub-user/{userId}:
 *   put:
 *     summary: Update a CMS sub-user
 *     tags: [CMS Sub User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the sub-user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

// Repeat similarly for delete and get endpoints...
