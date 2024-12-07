/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { eventService, eventSubmissionService, s3Service, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');
const validateEventSubmission = require('../validations/eventSubmission.validation');
const User = require('../models/user.model');
const { extractToken } = require('../utils/authUtils');

const createEventSubmission = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"eventId" is required');
  }

  const event = await eventService.getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EventApi not found');
  }

  const companyId = event.companyID;

  console.log('Incoming request body:', req.body);
  console.log('Incoming request files:', req.files);

  const fields = Object.keys(req.body).map((key) => ({
    name: key,
    value: req.body[key],
  }));

  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      const fileDetails = req.files[key];
      console.log(`Adding file field: ${fileDetails.fieldname}`);
      fields.push({
        name: fileDetails.fieldname,
        value: fileDetails,
      });
    });
  }

  console.log('Constructed fields for validation:', fields);

  // Validate all required fields
  const missingFields = event.fields.filter(
    (eventField) => eventField.required && !fields.some((field) => field.name === eventField.name)
  );

  if (missingFields.length > 0) {
    const missingFieldNames = missingFields.map((field) => field.label).join(', ');
    throw new ApiError(httpStatus.BAD_REQUEST, `Missing required fields: ${missingFieldNames}`);
  }

  // Continue with existing validation logic
  const { error } = validateEventSubmission(event.fields).validate({ fields });
  if (error) {
    console.error('Validation error:', error.details);
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  // Array to track valid files
  const validFiles = [];

  for (const field of fields) {
    const eventField = event.fields.find((f) => f.name === field.name);

    if (!eventField) {
      console.error(`Invalid field: ${field.name}`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid field: ${field.name}`);
    }

    if (eventField.required && !field.value) {
      console.error(`Field ${field.name} is required`);
      throw new ApiError(httpStatus.BAD_REQUEST, `Field ${field.name} is required`);
    }

    if (eventField.type === 'string' && typeof field.value === 'string') {
      if (eventField.max_characters && field.value.length > eventField.max_characters) {
        console.error(`Field ${field.name} exceeds max length`);
        throw new ApiError(httpStatus.BAD_REQUEST, `Field ${field.name} exceeds max length`);
      }
    }

    if (eventField.type === 'options' && Array.isArray(field.value)) {
      const invalidOptions = field.value.filter((v) => !eventField.options.includes(v));
      if (invalidOptions.length > 0) {
        console.error(`Invalid options in field ${field.name}`);
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid options in field ${field.name}`);
      }
      if (field.value.length < eventField.min_options || field.value.length > eventField.max_options) {
        console.error(`Field ${field.name} has incorrect number of options`);
        throw new ApiError(httpStatus.BAD_REQUEST, `Field ${field.name} has incorrect number of options`);
      }
    }

    if (eventField.type === 'file') {
      const fileDetails = field.value;
      if (!fileDetails) {
        console.error(`File is required for field ${field.name}`);
        throw new ApiError(httpStatus.BAD_REQUEST, `File is required for field ${field.name}`);
      }

      if (fileDetails.size > eventField.max_file_size) {
        console.error(`File size exceeds limit for field ${field.name}`);
        throw new ApiError(httpStatus.BAD_REQUEST, `File size exceeds limit for field ${field.name}`);
      }

      const allowedFormats = eventField.allowed_formats;
      if (!allowedFormats.includes(fileDetails.mimetype)) {
        console.error(`Invalid file format for field ${field.name}`);
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid file format for field ${field.name}`);
      }

      // Get the file extension from the original name
      const fileExtension = fileDetails.originalname.split('.').pop();

      // Generate the S3 path
      const s3Path = `eventFiles/${eventId}_${Date.now()}.${fileExtension}`;

      // Store valid file information for uploading later
      validFiles.push({ s3Path, buffer: fileDetails.buffer, field });
    }
  }



  // Upload all valid files to S3
  for (const { s3Path, buffer, field } of validFiles) {
    // eslint-disable-next-line no-await-in-loop
    const s3Response = await s3Service.uploadFile(s3Path, buffer);
    field.value = {
      location: s3Response.Location, // Assuming s3Response contains the Location
      size: buffer.length, // You can store the actual size from the buffer
    };
  }

  // Create event submission in the database
  const submission = await eventSubmissionService.createEventSubmission({
    eventId,
    companyId,
    fields,
  });

  res.status(httpStatus.CREATED).send(submission);
});

const getEventSubmissionByEventId = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10 } = req.query; // Default values for page and limit

  if (!eventId) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"eventApiId" is required');
  }

  // Extract and validate token from Authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Ensure user has permission to access submissions
  if (!user.permissions.includes('getEvent')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to access event submissions');
  }

  // Fetch the event to validate that the user can access it
  const event = await eventService.getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Get event submissions by eventId with pagination
  const result = await eventSubmissionService.getSubmissionsByEventId(eventId, Number(page), Number(limit));

  // Ensure the user's companyId matches the event submission's companyId
  result.submissions.forEach((submission) => {
    if (submission.companyId.toString() !== user.companyId.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User does not have access to these submissions');
    }

    submission.fields.forEach((field) => {
      if (field.value && field.value.location) {
        const fileName = field.value.location.split('/').pop();
        field.value.signedUrl = s3Service.getSignedUrl(fileName);
      }
    });
  });

  res.status(httpStatus.OK).send(result);
});

const deleteEventSubmission = catchAsync(async (req, res) => {
  const { eventSubmissionId } = req.params;

  // Check if eventSubmissionId is provided
  if (!eventSubmissionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, '"eventSubmissionId" is required');
  }

  // Extract and validate token from Authorization header
  const token = extractToken(req.headers.authorization);
  const decodedToken = await tokenService.verifyToken(token, 'access');

  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token type');
  }

  const userId = decodedToken.user;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Ensure user has permission to delete submissions
  if (!user.permissions.includes('deleteEvent')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to delete event submissions');
  }

  // Fetch the submission by eventSubmissionId
  const submission = await eventSubmissionService.getSubmissionById(eventSubmissionId);

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event submission not found');
  }

  // Ensure the user's companyId matches the event submission's companyId
  if (submission.companyId.toString() !== user.companyId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have access to delete this submission');
  }

  // Delete associated files from S3
  for (const field of submission.fields) {
    if (field.value && field.value.location) {
      const fileName = field.value.location.split('/').pop();
      // eslint-disable-next-line no-await-in-loop
      await s3Service.deleteFile(fileName); // Delete the file from S3
    }
  }

  // Delete the submission from the database
  await eventSubmissionService.deleteSubmissionById(eventSubmissionId);

  res.status(httpStatus.OK).send({ message: 'Event submission deleted successfully' });
});

module.exports = {
  createEventSubmission,
  getEventSubmissionByEventId,
  deleteEventSubmission,
};
