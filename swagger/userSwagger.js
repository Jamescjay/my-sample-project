const swaggerJsDoc = require("swagger-jsdoc");

const userSwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API documentation for User endpoints",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },
  apis: ["./routes/userRoutes.js"],
};

const userSwaggerDocs = swaggerJsDoc(userSwaggerOptions);

module.exports = userSwaggerDocs;
