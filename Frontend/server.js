const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Feedback_storage', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Feedback schema and model
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  rating: Number,
  satisfaction: Number,
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname)));

// Render the feedback form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle feedback submission
app.post('/feedback', async (req, res) => {
  try {
    const { name, email, message, rating, satisfaction } = req.body;
    const feedback = new Feedback({ name, email, message, rating, satisfaction });
    await feedback.save();
    res.status(201).json({ success: true, message: 'Feedback saved!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving feedback.' });
  }
});

// (Optional) Get all feedbacks
app.get('/feedbacks', async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbacks);
});

app.listen(5500, () => {
  console.log('Server is running on http://localhost:5500');
});