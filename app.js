const express = require("express");
const app = express();

// Load environment variables from .env file
require("dotenv").config();

const apiUrl = process.env.API_URL || "/api/v1";
// Middleware to parse JSON requests
app.use(express.json());

// http://localhost:3000/api/v1/products
app.get(apiUrl + "/products", (req, res) => {
  res.send("Welcome to the E-Commerce API");
});

app.listen(3000, () => {
  console.log(`API URL is set to: ${apiUrl}`);
  console.log("Server is running on port http://localhost:3000");
});
