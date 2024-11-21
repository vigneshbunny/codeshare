const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Middleware to parse incoming request bodies as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB using the connection string from the environment variables
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define a Mongoose schema and model for storing code
const codeSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true }, // Ensure the URL is unique
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Expires after 24 hours
});

const Code = mongoose.model('Code', codeSchema);

// Route to get code by URL
app.get('/:url', async (req, res) => {
  try {
    const code = await Code.findOne({ url: req.params.url });
    if (code) {
      res.json({ code: code.code });
    } else {
      res.json({ code: '' }); // If no code found, return an empty string
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving code' });
  }
});

// Route to post new code by URL
app.post('/:url', async (req, res) => {
  const { code } = req.body;
  try {
    const existingCode = await Code.findOne({ url: req.params.url });
    if (existingCode) {
      // If code already exists, update it
      existingCode.code = code;
      await existingCode.save();
    } else {
      // If code does not exist, create a new entry
      const newCode = new Code({
        url: req.params.url,
        code
      });
      await newCode.save();
    }
    res.status(200).json({ message: 'Code saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving code' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
