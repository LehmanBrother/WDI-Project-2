const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	body: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	}
	//post-mvp: votes
});

module.exports = mongoose.model('Comment', commentSchema);