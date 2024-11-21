// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Initialize dotenv to load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Get the MongoDB URI and port from environment variables
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Root route
app.get('/', (req, res) => {
  res.send('Hello, World! MongoDB connection is successful!');
});

// Example route to check if the server is working
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
