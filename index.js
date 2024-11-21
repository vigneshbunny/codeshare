const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Initialize environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// MongoDB connection string from environment variables
const mongoURI = process.env.MONGO_URI;

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connection is successful!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Define a simple schema and model for users
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// Home Route (GET)
app.get('/', (req, res) => {
  res.send('Hello, World! MongoDB connection is successful!');
});

// API Route (GET) - Simple route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Custom route for /hiiii
app.get('/hiiii', (req, res) => {
  res.send('You have reached the /hiiii route!');
});

// API Route (GET) - Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the database
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});

// Add User Route (POST) - Create a new user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = new User({ name, email });
    await newUser.save();
    res.json({ message: 'User added successfully!', user: newUser });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Error adding user');
  }
});

// Set the port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
