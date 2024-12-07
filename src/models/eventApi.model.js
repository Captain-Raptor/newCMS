const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['string', 'options', 'file'], required: true },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  max_characters: { type: Number },
  options: { type: [String] }, // Only applicable if type is 'options'
  min_options: { type: Number },
  max_options: { type: Number },
  allowed_formats: { type: [String] }, // Only applicable if type is 'file'
  max_file_size: { type: Number }, // Only applicable if type is 'file'
});

const EventSchema = new mongoose.Schema(
  {
    event_name: { type: String, required: true },
    fields: [FieldSchema],
    companyID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventApi', EventSchema);
