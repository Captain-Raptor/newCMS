const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef'); // Swagger definition file

const router = express.Router();

// Generate Swagger specs
const specs = swaggerJsdoc({
  swaggerDefinition, // Your Swagger definition
  apis: ['src/docs/*.yml', 'src/routes/v1/*.js'], // API docs and routes
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);

// Route to display Swagger UI
router.get(
  '/',
  (req, res, next) => {
    try {
      swaggerUi.setup(specs, { explorer: true })(req, res); // Setup Swagger with explorer option
    } catch (error) {
      next(error); // Handle any error
    }
  }
);

module.exports = router;
