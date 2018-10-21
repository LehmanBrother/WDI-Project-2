const mongoose = require('mongoose');
const Vote  = require('./vote');

const questionSchema = new mongoose.Schema({
	briefDesc: {
		type: String,
		required: true
	},
	fullDesc: String,
	img: String,
	username: {
		type: String,
		required: true
	},
	votes: [Vote.schema]
});

module.exports = mongoose.model('Question', questionSchema);