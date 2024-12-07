// docs/swaggerDef.js
const swaggerDefinition = {
  openapi: '3.0.0', // OpenAPI version
  info: {
    title: 'Imaggar Website ', // API title
    version: '1.0.0', // API version
    description: 'csk returens', // API description
  },
  servers: [
    {
      url: 'http://localhost:5000/v1', // Base URL for your API
      
    },
  ],
};

module.exports = swaggerDefinition;
