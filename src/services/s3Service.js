/* eslint-disable no-console */
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Function to upload a file
const uploadFile = async (path, fileBuffer) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: path,
    Body: fileBuffer,
  };

  return s3.upload(params).promise();
};

// Function to generate signed URL
const getSignedUrl = (filePath) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filePath,
    Expires: 60 * 5, // URL valid for 5 minutes
  };

  return s3.getSignedUrl('getObject', params);
};

const deleteFile = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `eventFiles/${fileName}`,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error(`Error deleting file: ${fileName}`, err);
        reject(err);
      } else {
        console.log(`File deleted successfully: ${fileName}`);
        resolve(data);
      }
    });
  });
};
const deleteS3File = async (filePath) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filePath,
  };
  return s3.deleteObject(params).promise();
};
module.exports = {
  uploadFile,
  getSignedUrl, // Ensure getSignedUrl is exported
  deleteFile,
  deleteS3File,
};
