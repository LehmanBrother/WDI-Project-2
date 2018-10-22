const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Vote = require('../models/vote');
const Comment = require('../models/comment')
const User = require('../models/user')
const Article = require('../models/article')

//question vote post route
router.post('/:index/vote', async (req, res) => {
	console.log(req.body);
	if(req.session.logged) {
		try {
			const newVote = await Vote.create({
				username: [req.session.username],
				value: Number(req.body.vote)
			});
			const currentQuestion = await Question.findById(req.params.index);
			currentQuestion.votes.push(newVote);
			const voteCount = currentQuestion.votes.length;
			let voteSum = 0;
			for(let i = 0; i < currentQuestion.votes.length; i++) {
				voteSum += currentQuestion.votes[i].value;
			}
			currentQuestion.voteBalance = Math.round(100*voteSum/voteCount)/100;
			console.log(currentQuestion.votes);
			console.log(currentQuestion.voteBalance);
			currentQuestion.save();e: req.session.message
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

// Article create Route
router.post('/:index/article', async (req, res) => {
	try {
		const articleToAdd = {
			title: req.body.title,
			articleLink: req.body.article,
			username: req.session.username
		}
		const questionArticle = await Article.create(articleToAdd);
		const foundQuestion = await Question.findById(req.params.index);
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

// Comment create Route
router.post('/:index/comment', async (req, res, next) => {
	console.log(req.body);
	try {
		const commentToAdd = {
			body: req.body.comment,
			username: req.session.username
		}
		const questionComment = await Comment.create(commentToAdd);
		const foundQuestion = await Question.findById(req.params.index);
		const foundUser = await User.findOne({username: req.session.username});
		foundQuestion.comments.push(questionComment);
		foundUser.comments.push(questionComment);
		foundQuestion.save();
		foundUser.save();
		// Question.findById(req.params.index, (err, foundQuestion) => {
			res.render('questions/show.ejs', {
				question: foundQuestion,
				username: req.session.username,
				message: req.session.message
			});
		// });
	} catch(err) {
		console.log();
		next(err);
	}
});

module.exports = router;