const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // This helps load environment variables

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection URI from environment variable
const uri = process.env.MONGO_URI;

async function connectToDatabase() {
  try {
    // Create a new MongoClient and connect to the database
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    console.log("Connected to MongoDB!");

    // Access a specific database (e.g., temp-share)
    const database = client.db('temp-share');
    const collection = database.collection('sessions'); // Example collection

    // Example: Insert a new document to test
    await collection.insertOne({ sessionId: 'test123', content: 'This is a test session' });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToDatabase();

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from your backend!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
