const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const path = require('path');

// Load environment variables
dotenv.config();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB model for storing the code
const codeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // expires in 24 hours
});

const Code = mongoose.model('Code', codeSchema);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connection successful!');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Main page route
app.get('/', (req, res) => {
  res.send("Let's get started!");
});

// Custom URL route to display existing code or provide a form for new code
app.get('/:customURL', async (req, res) => {
  const customURL = req.params.customURL;

  try {
    // Look for code already saved for the given custom URL
    const foundCode = await Code.findOne({ _id: customURL });

    if (foundCode) {
      // If code exists, display it
      res.send(`<h1>Code for URL: ${customURL}</h1><pre>${foundCode.code}</pre>`);
    } else {
      // If no code found, show a form to upload code
      res.send(`
        <h1>No code found for this URL!</h1>
        <p>You can submit your own code here:</p>
        <form action="/${customURL}" method="POST">
          <textarea name="code" rows="10" cols="50" placeholder="Write your code here"></textarea><br>
          <button type="submit">Submit Code</button>
        </form>
      `);
    }
  } catch (error) {
    console.error('Error fetching code:', error);
    res.status(500).send('Internal Server Errorrrrrr');
  }
});

// Handle POST request to save new code
app.post('/:customURL', async (req, res) => {
  const customURL = req.params.customURL;
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Code cannot be empty');
  }

  try {
    // Save the code to the database with the custom URL as the ID
    const newCode = new Code({
      _id: customURL,
      code,
    });

    await newCode.save();

    res.send(`<h1>Code successfully uploaded!</h1><p>Your code is now accessible at: <a href="/${customURL}">${customURL}</a></p>`);
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).send('Internal Server Errorrrrr');
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
