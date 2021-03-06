const mongoose = require('mongoose');
const Vote  = require('./vote');
const Comment = require('./comment');
const Article = require('./article');

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
	created_at: {
		type: Date,
		default: Date.now
	},
	voteCount: Number,
	voteBalance: Number,
	voteControversy: Number,
	votes: [Vote.schema],
	comments: [Comment.schema],
	articles: [Article.schema]
});

module.exports = mongoose.model('Question', questionSchema);