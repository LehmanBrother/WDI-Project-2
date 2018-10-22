const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
	title: {
		type: String, 
		required: true
	},
	articleLink: {
		type: String,
		required: true
	},
	imgLink: String,
	username: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Article', articleSchema);