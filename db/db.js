const mongoose = require('mongoose');
const connectionString = 'mongodb://localhost/vote';
const mongoDbUrl = process.env.MONGODB_URI || connectionString

mongoose.connect(mongoDbUrl, { useNewUrlParser: true});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected at ', connectionString);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected ');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose error ', err);
});