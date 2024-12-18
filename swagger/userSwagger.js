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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional: Specify the token format
        },
      },
    },
  },
  apis: [
    "./routes/userRoutes.js",
    "./routes/postRoutes.js",
    "./routes/commentRoutes.js",
  ], // Added postRoutes.js and commentRoutes.js to the APIs array
};

const userSwaggerDocs = swaggerJsDoc(userSwaggerOptions);

module.exports = userSwaggerDocs;
