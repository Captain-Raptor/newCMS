// user.model.js
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 12,
      validate(value) {
        if (
          !value.match(/[A-Z]/) || // Uppercase letter
          !value.match(/[a-z]/) || // Lowercase letter
          !value.match(/\d/) || // Digit
          !value.match(/[!@#$%^&*(),.?":{}|<>]/) // Special character
        ) {
          throw new Error(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          );
        }
      },
      private: true, // Used by the toJSON plugin
    },
    role: {
      type: String,
      enum: ['CMS_ADMIN_USER', 'CMS_SUB_USER'],
      default: 'CMS_SUB_USER',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    
    },
    isCompanyRegistered: {
      type:Boolean,
      default: false, // Corrected the typo from 'nun' to 'null'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The ID of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
