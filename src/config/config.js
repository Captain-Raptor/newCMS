const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load environment variables from the .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define the validation schema for the environment variables
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB URL'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('Minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('Days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('Minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('Minutes after which verify email token expires'),
    SELF_COMPANY_REGISTER_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('Minutes after which self company register token expires'),
    SMTP_HOST: Joi.string().description('Server that will send the emails'),
    SMTP_PORT: Joi.number().description('Port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('Username for email server'),
    SMTP_PASSWORD: Joi.string().description('Password for email server'),
    EMAIL_FROM: Joi.string().description('The "from" field in the emails sent by the app'),
    DOMAIN_URL: Joi.string().description('Domain URL for email links'),
    AWS_ACCESS_KEY_ID: Joi.string().required().description('AWS access key ID'),
    AWS_SECRET_ACCESS_KEY: Joi.string().required().description('AWS secret access key'),
    AWS_REGION: Joi.string().required().description('AWS region'),
    AWS_S3_BUCKET: Joi.string().required().description('AWS S3 bucket name'),
  })
  .unknown();

// Validate and parse the environment variables
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export the configuration
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    selfCompanyRegisterExpirationMinutes: envVars.SELF_COMPANY_REGISTER_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  domainUrl: envVars.DOMAIN_URL,
  apiBaseUrl: envVars.API_BASE_URL,
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
};
