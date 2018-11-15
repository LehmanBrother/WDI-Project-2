const mongoose = require('mongoose');

<<<<<<< HEAD
const connectionString = 'mongodb://localhost/vote1';
=======
const connectionString = 'mongodb://localhost/vote';
const mongoDbUrl = process.env.MONGODB_URI || connectionString
>>>>>>> f31acfbca80247215f49c9d1099eae1493bc61b5

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