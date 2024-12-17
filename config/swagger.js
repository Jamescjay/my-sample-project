const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "REST API", version: "1.0.0", description: "Test API" },
  },
  apis: ["./routes/*.js"], // Point to route files
};

const swaggerSpecs = swaggerJsDoc(options);

module.exports = { swaggerSpecs, swaggerUi };
