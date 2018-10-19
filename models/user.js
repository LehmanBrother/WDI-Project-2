const mongoose = require('mongoose');
const Question  = require('./question');
const Comment  = require('./comment');
const Article  = require('./article');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	questions: [Question.schema],
	comments: [Comment.schema],
	articles: [Article.schema]
});

module.exports = mongoose.model('User', userSchema);