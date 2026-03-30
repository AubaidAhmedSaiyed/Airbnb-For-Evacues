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

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));

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
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});