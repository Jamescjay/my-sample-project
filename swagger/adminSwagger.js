const swaggerJsDoc = require("swagger-jsdoc");

const adminSwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin API",
      version: "1.0.0",
      description: "API documentation for Admin endpoints",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", 
        },
      },
    },
  },
  apis: ["./routes/adminRoutes.js"], 
};

const adminSwaggerDocs = swaggerJsDoc(adminSwaggerOptions);

module.exports = adminSwaggerDocs;
