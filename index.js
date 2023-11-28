const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT
// Import the autoReply module
const gmail = require("./autoReply.js");

// Use the autoReply module
gmail.startAutoReply();


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});