// authUtils.js

// Function to extract token from the Authorization header
const extractToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new Error('Authorization header is missing');
  }

  // Extract token from the header
  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    throw new Error('Token is missing from Authorization header');
  }

  return token;
};

module.exports = { extractToken };
