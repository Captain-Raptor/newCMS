const mongoose = require('mongoose');

const BlogApiSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogApi', BlogApiSchema);
