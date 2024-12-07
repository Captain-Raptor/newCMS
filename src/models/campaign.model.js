const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['email', 'phone'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    openAt: {
      // Add the new field here
      type: Date,
      default: null,
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Company',
    },
    campaignApiID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'CampaignApi',
    },
    campaignApiName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
