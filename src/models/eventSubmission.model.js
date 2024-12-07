const mongoose = require('mongoose');

const EventSubmissionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventApi', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  fields: [
    {
      name: { type: String, required: true },
      value: mongoose.Schema.Types.Mixed, // Can be string, array, or URL for files
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventSubmission', EventSubmissionSchema);
