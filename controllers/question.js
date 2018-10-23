const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Vote = require('../models/vote');
const Comment = require('../models/comment')
const User = require('../models/user')
const Article = require('../models/article')

//question delete route
router.delete('/:index', async (req, res) => {
	try {
		const deletedQuestion = await Question.findByIdAndDelete(req.params.index);
		//make arrays of all v/c/a ids
		let deletedVoteIds = [];
		for(let i = 0; i < deletedQuestion.votes.length; i++) {
			deletedVoteIds.push(deletedQuestion.votes[i].id);
		}
		console.log(deletedVoteIds + '<-----deletedVoteIds');
		let deletedCommentIds = [];
		for(let i = 0; i < deletedQuestion.comments.length; i++) {
			deletedCommentIds.push(deletedQuestion.comments[i].id);
		}
		console.log(deletedCommentIds + '<-----deletedCommentIds');
		let deletedArticleIds = [];
		for(let i = 0; i < deletedQuestion.articles.length; i++) {
			deletedArticleIds.push(deletedQuestion.articles[i].id);
		}
		console.log(deletedArticleIds + '<-----deletedArticleIds');
		//in user, delete question, comments, and articles
		// const user = await User.find({username: deletedQuestion.username});
		//in their own collections, delete comments, votes, and articles
		const deletedVotes = await Vote.deleteMany({
			_id: {$in: deletedVoteIds}
		});
		const deletedComments = await Comment.deleteMany({
			_id: {$in: deletedCommentIds}
		});
		const deletedArticles = await Article.deleteMany({
			_id: {$in: deletedArticleIds}
		});
		res.redirect('/');
	} catch(err) {
		res.send(err);
	}
})

//question vote post route
router.post('/:index/vote', async (req, res) => {
	console.log(req.body);
	if(req.session.logged) {
		try {
			const currentQuestion = await Question.findById(req.params.index);
			const newVote = await Vote.create({
				username: [req.session.username],
				value: Number(req.body.vote)
			});
			currentQuestion.votes.push(newVote);
			const voteCount = currentQuestion.votes.length;
			let voteSum = 0;
			for(let i = 0; i < currentQuestion.votes.length; i++) {
				voteSum += currentQuestion.votes[i].value;
			}
			currentQuestion.voteBalance = Math.round(100*voteSum/voteCount)/100;
			console.log(currentQuestion.votes);
			console.log(currentQuestion.voteBalance);
			currentQuestion.save();
		} catch(err) {
			res.send(err);
		}
	} else {
		req.session.message = 'You must be logged in to vote.'
	}
	Question.findById(req.params.index, (err, foundQuestion) => {
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	})
})

// Comment New Route
router.get('/:index/comment', async(req, res) => {
	if(req.session.logged) {
		const foundQuestion = await Question.findById(req.params.index)
		res.render('comments/new.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	} else {
		req.session.message = 'You must be logged in to comment.'
	}
	Question.findById(req.params.index, (err, foundQuestion) => {
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	})
})

//article show route
router.get('/:index/article', async (req, res) => {
	if(req.session.logged) {
		const foundQuestion = await Question.findById(req.params.index)
		res.render('articles/new.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	} else {
		req.session.message = 'You must be logged in to add an article.'
	}
	Question.findById(req.params.index, (err, foundQuestion) => {
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	})
})

// Article post Route
router.post('/:index/article', async (req, res) => {
	try {
		const foundQuestion = await Question.findById(req.params.index);
		const articleToAdd = {
			title: req.body.title,
			articleLink: req.body.article,
			username: req.session.username
		}
		const questionArticle = await Article.create(articleToAdd);
		const foundUser = await User.findOne({username: req.session.username});
		foundQuestion.articles.push(questionArticle);
		foundUser.articles.push(questionArticle);
		foundQuestion.save();
		foundUser.save();
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		})
	} catch(err) {
		res.send(err)
	}
})

// Comment post Route
router.post('/:index/comment', async (req, res, next) => {
	console.log(req.body);
	try {
		const foundQuestion = await Question.findById(req.params.index);
		const commentToAdd = {
			body: req.body.comment,
			username: req.session.username
		}
		const questionComment = await Comment.create(commentToAdd);
		const foundUser = await User.findOne({username: req.session.username});
		foundQuestion.comments.push(questionComment);
		foundUser.comments.push(questionComment);
		foundQuestion.save();
		foundUser.save();
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		});
	} catch(err) {
		console.log();
		next(err);
	}
});

module.exports = router;