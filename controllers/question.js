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
			await currentQuestion.save();
			res.render('questions/show.ejs', {
				question: currentQuestion,
				username: req.session.username,
				message: req.session.message
			})
		} catch(err) {
			res.send(err);
		}
	} else {
		req.session.message = 'You must be logged in to vote.'
	}
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
		next(err);
	}
});

//comment delete route
router.delete('/:index/comment/:commentIndex', async (req, res, next) => {
	try {
		const deletedComment = await Comment.findByIdAndDelete(req.params.commentIndex);
		const currentQuestion = await Question.findById(req.params.index);
		currentQuestion.comments.splice(currentQuestion.comments.findIndex((comment) => {
			return comment.id === deletedComment.id;
		}),1);
		currentQuestion.save();
		res.render('questions/show.ejs', {
			question: currentQuestion,
			username: req.session.username,
			message: req.session.message
		});
	} catch(err) {
		next(err);
	}
})

//article delete route
router.delete('/:index/article/:articleIndex', async (req, res, next) => {
	try {
		console.log(req.params.index + ' <~~ This is req.params.index');
		console.log(req.params.articleIndex + ' <~~ This is req.params.articleIndex');
		const deletedArticle = await Article.findByIdAndDelete(req.params.articleIndex);
		console.log(deletedArticle + ' <~~~ deletedArticle');
		const currentQuestion = await Question.findById(req.params.index);
		console.log(currentQuestion + ' <~~ currentQuestion');
		currentQuestion.articles.splice(currentQuestion.comments.findIndex((article) => {
			return article.id === deletedArticle.id;
		}),1);
		currentQuestion.save();
		res.render('questions/show.ejs', {
			question: currentQuestion,
			username: req.session.username,
			message: req.session.message
		});
	} catch(err) {
		next(err);
	}
})

// Comment Edit route
router.get('/:index/comment/:commentIndex/edit', async (req, res) => {
	if(req.session.logged) {
		try{
			const foundQuestion = await Question.findById(req.params.index);
			const commentToEdit = await Comment.findById(req.params.commentIndex);
			res.render('comments/edit.ejs', {
				comment: commentToEdit,
				question: foundQuestion,
				username: req.session.username,
				message: req.session.message
			})

		} catch(err) {
			res.send(err)
		}
	} else {
		req.session.message = 'Please log in to edit your comment'
	}
})

// Article Edit route
router.get('/:index/article/:articleIndex/edit', async (req, res) => {
	if(req.session.logged) {
		try{
			const foundQuestion = await Question.findById(req.params.index);
			const articleToEdit = await Article.findById(req.params.articleIndex);
			res.render('articles/edit.ejs', {
				article: articleToEdit,
				question: foundQuestion,
				username: req.session.username,
				message: req.session.message
			})
		} catch(err) {
			res.send(err)
		}
	} else {
		req.session.message = 'Please log in to edit your comment'
	}
})

// Comment Put Route
router.put('/:index/comment/:commentIndex', async (req, res) => {
	try {
		const updatedComment = {
			body: req.body.comment,
			username: req.session.username
		}
		const commentToUpdate = await Comment.findByIdAndUpdate(req.params.commentIndex, updatedComment, {new:true});
		commentToUpdate.save()
		const foundQuestion = await Question.findById(req.params.index);
		const index = foundQuestion.comments.findIndex((comment) => {
			return comment.id === commentToUpdate.id
		})
		console.log(index);
		foundQuestion.comments[index] = commentToUpdate;
		foundQuestion.save();
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		});
	} catch(err) {
		res.send(err)
	}
})
// Article Put Route
router.put('/:index/article/:articleIndex', async (req, res) => {
	try {
		const updatedArticle = {
			title: req.body.title,
			articleLink: req.body.article,
			username: req.session.username
		}
		const articleToUpdate = await Article.findByIdAndUpdate(req.params.articleIndex, updatedArticle, {new: true});
		articleToUpdate.save();
		const foundQuestion = await Question.findById(req.params.index);
		const index = foundQuestion.articles.findIndex((article) => {
			return article.id === articleToUpdate.id
		})
		console.log(index + ' <~~ Index number');
		foundQuestion.articles[index] = articleToUpdate;
		foundQuestion.save();
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		});
	} catch(err) {
		res.send(err)
	}
})







module.exports = router;