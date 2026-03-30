require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');

const evacueeRoutes = require('./routes/evacuee.js');
const volunteerRoutes = require('./routes/volunteer.js');
const apiAuth = require('./routes/api/auth');
const apiListings = require('./routes/api/listings');
const apiBookings = require('./routes/api/bookings');
const apiUsers = require('./routes/api/users');
const apiNotifications = require('./routes/api/notifications');
const errorHandler = require('./middleware/errorHandler');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/Sheltr';

const connectMongo = async () => {
  // Add explicit timeouts so Vercel doesn't keep requests hanging forever.
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000
  });
};

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));

// Avoid long hangs when Mongo isn't ready (common during Vercel cold starts).
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not ready. Please retry in a moment.' });
  }
  next();
});

app.use('/api/auth', apiAuth);
app.use('/api/listings', apiListings);
app.use('/api/bookings', apiBookings);
app.use('/api/users', apiUsers);
app.use('/api/notifications', apiNotifications);

app.use('/evacuee', evacueeRoutes);
app.use('/volunteer', volunteerRoutes);

app.get('/', (req, res) => {
  res.render('index', { message: 'Welcome to Airbnb for Evacuees' });
});

app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectMongo();
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}

startServer();