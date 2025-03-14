const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const swaggerDefinition = require('./docs/swaggerDef'); // Adjust path as necessary

const app = express();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/**/*.js'], // Path to your API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());


// Allow specific domains
const allowedOrigins = [
  'https://imaggar.in',        // Your frontend domain
  'https://www.imaggar.in',    // Alternative with "www"
  'http://localhost:5000',     // Local development
  'http://localhost:5173',     // Local development

];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin, such as mobile apps or server-to-server requests
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true,                                   // Allow credentials like cookies, headers
  allowedHeaders: ['Content-Type', 'Authorization'],   // Allowed headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable preflight requests (OPTIONS)
app.options('*', cors(corsOptions));
// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
