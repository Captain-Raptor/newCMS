const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  blogApiName: { type: String, required: true }, // Store the name of the Blog API
  blogApiId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogApi', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  heading: { type: String, required: true },
  subheading: { type: String, optional: true },
  bodyContent: { type: String, required: true },
  bannerImageUrl: { type: String, required: true },
  thumbnailImageUrl: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the blog
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who last updated the blog
  createdAt: { type: Date, default: Date.now }, // Auto-set to current date
  updatedAt: { type: Date }, // Auto-set to current date when updated
});

BlogSchema.pre('save', function (next) {
  this.updatedAt = Date.now(); // Automatically set updatedAt on every save
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
