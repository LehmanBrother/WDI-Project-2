const mongoose = require('mongoose');

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
	votes: [Number]
});

module.exports = mongoose.model('Question', questionSchema);