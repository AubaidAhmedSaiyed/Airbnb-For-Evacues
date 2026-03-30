const mongoose = require('mongoose');
const initdata = require('./data');
const Listing = require('../models/listing');
const User = require('../models/user');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/Sheltr';

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log('Connected to MongoDB for init');
    return initDb();
  })
  .catch((err) => {
    console.error('DB init error', err);
  });

async function initDb() {
  await Listing.deleteMany({});
  await User.deleteMany({});

  const host = new User({
    name: 'Seeder Host',
    email: 'host@example.com',
    password: 'password123',
    role: 'host'
  });

  const guest = new User({
    name: 'Seeder Guest',
    email: 'guest@example.com',
    password: 'password123',
    role: 'guest'
  });

  await host.save();
  await guest.save();

  const listingsData = initdata.data.map((item) => ({
    host: host._id,
    title: item.sheltrType || 'Evacuation Shelter',
    description: item.notes || '',
    location: item.location || { address: 'Unknown', country: 'Unknown' },
    price: item.price || 0,
    capacity: item.capacity || 1,
    images: item.image ? [item.image] : [],
    availableFrom: item.availableFrom ? new Date(item.availableFrom) : undefined,
    availableUntil: item.availableUntil ? new Date(item.availableUntil) : undefined
  }));

  await Listing.insertMany(listingsData);
  console.log('Data Initialized');
  process.exit(0);
}
