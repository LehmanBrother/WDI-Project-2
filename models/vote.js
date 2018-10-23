const mongoose = require('mongoose');
const Question  = require('./question');

const voteSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	value: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Vote', voteSchema);