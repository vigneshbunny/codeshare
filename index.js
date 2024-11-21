const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB using the connection string from environment variables
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define a Mongoose schema and model for storing code with a custom URL
const codeSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Expires after 24 hours
});
const Code = mongoose.model('Code', codeSchema);

// Route to get code by custom URL
app.get('/:url', async (req, res) => {
  try {
    const code = await Code.findOne({ url: req.params.url });
    if (code) {
      res.json({ code: code.code });
    } else {
      res.status(404).json({ message: 'Code not found or expired' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving code' });
  }
});

// Route to upload code to a custom URL
app.post('/:url', async (req, res) => {
  const { code } = req.body;
  try {
    const existingCode = await Code.findOne({ url: req.params.url });
    if (existingCode) {
      // If code already exists for this URL, update it
      existingCode.code = code;
      await existingCode.save();
    } else {
      // If code doesn't exist, create a new entry
      const newCode = new Code({
        url: req.params.url,
        code
      });
      await newCode.save();
    }
    res.status(200).json({ message: 'Code uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading code' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
