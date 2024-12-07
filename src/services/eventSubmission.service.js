const httpStatus = require('http-status');
const EventSubmission = require('../models/eventSubmission.model');
const ApiError = require('../utils/ApiError');
const s3Service = require('./s3Service'); // Ensure you import your S3 service

const createEventSubmission = async (submissionData) => {
  const submission = new EventSubmission(submissionData);
  await submission.save();
  return submission;
};

const getSubmissionsByEventId = async (eventId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await EventSubmission.countDocuments({ eventId });
  const submissions = await EventSubmission.find({ eventId }).skip(skip).limit(limit);

  if (!submissions || submissions.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No submissions found for this event');
  }

  submissions.forEach((submission) => {
    submission.fields.forEach((field) => {
      if (field.value && field.value.location) {
        const signedUrl = s3Service.getSignedUrl(field.value.location.split('/').pop());
        // eslint-disable-next-line no-param-reassign
        field.value.signedUrl = signedUrl;
      }
    });
  });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    submissions,
  };
};

const getSubmissionById = async (eventSubmissionId) => {
  const submission = await EventSubmission.findById(eventSubmissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event submission not found');
  }
  return submission;
};

const deleteSubmissionById = async (eventSubmissionId) => {
  const submission = await EventSubmission.findByIdAndDelete(eventSubmissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event submission not found');
  }
  return submission;
};
module.exports = {
  createEventSubmission,
  getSubmissionsByEventId,
  getSubmissionById,
  deleteSubmissionById,
};
