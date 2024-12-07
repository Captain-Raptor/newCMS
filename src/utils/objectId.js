const { Types } = require('mongoose');

const objectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid'); // or use a custom error message
  }
  return value; // return the value if valid
};

module.exports = {
  objectId,
};
