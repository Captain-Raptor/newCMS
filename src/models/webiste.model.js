const mongoose = require('mongoose');

// Social Media Schema
const SocialMediaSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true }
});

// Essentials Schema
const EssentialsSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  mobileLogo: { type: String },
  favicon: { type: String },
  socialMedias: [SocialMediaSchema]
});

// SEO Schema
const SEOSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: String, required: true },
  author: { type: String, default: 'Ace Book Official Team' },
  image: { type: String },
  imageAlt: { type: String },
  appleTouchIcon: { type: String }
});

// Content Types
const TextContentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  type: { type: String, enum: ['title', 'subtitle', 'normaltext'], default: 'normaltext' }
});

const ImageContentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' }
});

const VideoContentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' }
});

// Data Schema
const DataSchema = new mongoose.Schema({
  key: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['text', 'array_of_text', 'image', 'array_of_images', 'video', 'array_of_videos'] 
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

// Section Schema
const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: [DataSchema]
});

// Page Schema
const PageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sections: [SectionSchema]
});

// Website Schema
const WebsiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    essentials: EssentialsSchema,
    seo: SEOSchema,
    pageData: [PageSchema],
    companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);  

// Remove the pre-save hook checking for duplicate slugs
// No need for any slug-specific logic anymore

module.exports = mongoose.model('Website', WebsiteSchema);
