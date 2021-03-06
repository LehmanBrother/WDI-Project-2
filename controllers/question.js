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
router.post('/:index/vote', async (req, res, next) => {
	console.log(req.body);
	try {
		if(req.session.logged) {
			const currentQuestion = await Question.findById(req.params.index);
			let userCanVote = true;
			console.log(currentQuestion.votes);
			for(let i = 0; i < currentQuestion.votes.length; i++) {
				if(currentQuestion.votes[i].username === req.session.username) {
					userCanVote = false;
					break;
				}
			}
			if(userCanVote) {
				const newVote = await Vote.create({
					username: [req.session.username],
					value: Number(req.body.vote)
				});
				currentQuestion.votes.push(newVote);
				currentQuestion.voteCount = currentQuestion.votes.length;
				let voteSum = 0;
				let oneCount = 0;
				let twoCount = 0;
				let threeCount = 0;
				let fourCount = 0;
				let fiveCount = 0;
				for(let i = 0; i < currentQuestion.votes.length; i++) {
					if(currentQuestion.votes[i].value === 1) {
						oneCount++;
					} else if(currentQuestion.votes[i].value === 2) {
						twoCount++;
					} else if(currentQuestion.votes[i].value === 3) {
						threeCount++;
					} else if(currentQuestion.votes[i].value === 4) {
						fourCount++;
					} else if(currentQuestion.votes[i].value === 5) {
						fiveCount++;
					}
					voteSum += currentQuestion.votes[i].value;
				}
				currentQuestion.voteBalance = Math.round(100*voteSum/currentQuestion.voteCount)/100;
				const voteVariance = (
					Math.abs(5-currentQuestion.voteBalance)*fiveCount +
					Math.abs(4-currentQuestion.voteBalance)*fourCount +
					Math.abs(3-currentQuestion.voteBalance)*threeCount +
					Math.abs(2-currentQuestion.voteBalance)*twoCount +
					Math.abs(1-currentQuestion.voteBalance)*oneCount
				)/currentQuestion.voteCount;
				currentQuestion.voteControversy = Math.log(currentQuestion.voteCount)*voteVariance;
				console.log(currentQuestion.votes);
				console.log(currentQuestion.voteBalance);
				console.log(currentQuestion.voteControversy);
				await currentQuestion.save();
				res.redirect('/questions/' + req.params.index)
			} else {
				req.session.message = 'You have already voted on this question'
				res.redirect('/questions/' + req.params.index)
			}
		} else {
			const currentQuestion = await Question.findById(req.params.index);
			req.session.message = 'You must be logged in to vote'
			res.redirect('/questions/' + req.params.index)
		}
	} catch(err) {
		next(err);
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
	res.redirect('/questions/' + req.params.index)
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
	res.redirect('/questions/' + req.params.index)
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
		res.redirect('/questions/' + req.params.index)
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
		res.redirect('/questions/' + req.params.index)
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
		res.redirect('/questions/' + req.params.index)
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
		currentQuestion.articles.splice(currentQuestion.articles.findIndex((article) => {
			return article.id === deletedArticle.id;
		}),1);
		currentQuestion.save();
		res.redirect('/questions/' + req.params.index)
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
router.put('/:index/comment/:commentIndex', async (req, res, next) => {
	try {
		const updatedComment = {
			_id: req.params.commentIndex,
			body: req.body.comment,
			username: req.session.username
		}
		const commentToUpdate = await Comment.findByIdAndUpdate(req.params.commentIndex, updatedComment, {new:true});
		commentToUpdate.save();
		const foundQuestion = await Question.findById(req.params.index);
		foundQuestion.comments.splice(foundQuestion.comments.findIndex((comment) => {
			return comment.id === commentToUpdate.id;
		}),1,commentToUpdate);
		foundQuestion.save();
		const foundUser = await User.findOne({username: req.session.username});
		foundUser.comments.splice(foundUser.comments.findIndex((comment) => {
			return comment.id === commentToUpdate.id;
		}),1,commentToUpdate);
		foundUser.save();
		res.redirect('/questions/' + req.params.index)
	} catch(err) {
		next(err)
	}
})
// Article Put Route
router.put('/:index/article/:articleIndex', async (req, res, next) => {
	try {
		const updatedArticle = {
			_id: req.params.articleIndex,
			title: req.body.title,
			articleLink: req.body.article,
			username: req.session.username
		}
		const articleToUpdate = await Article.findByIdAndUpdate(req.params.articleIndex, updatedArticle, {new: true});
		articleToUpdate.save();
		const foundQuestion = await Question.findById(req.params.index);
		foundQuestion.articles.splice(foundQuestion.articles.findIndex((article) => {
			return article.id === articleToUpdate.id;
		}),1,articleToUpdate);
		foundQuestion.save();
		const foundUser = await User.findOne({username: req.session.username});
		foundUser.articles.splice(foundUser.articles.findIndex((article) => {
			return article.id === articleToUpdate.id;
		}),1,articleToUpdate);
		foundUser.save();
		res.redirect('/questions/' + req.params.index)
	} catch(err) {
		next(err)
	}
})





// Index Route

router.get('/', async (req, res) => {
	const allQuestions = await Question.find();
	res.render('index.ejs')
})
// Comment New Route
router.get('/:index/new', async(req, res) => {
	try {
		const foundQuestion = await Question.findById(req.params.index)
		res.render('/comments/new.ejs', {
			question: foundQuestion
		})
	} catch(err) {
		res.send(err)
	}
})

// Show Route
router.get('/:index', (req, res) => {
	Question.findById(req.params.index, (err, foundQuestion) => {
		res.render('questions/show.ejs', {
			question: foundQuestion
		});
	});
});

// post route
router.post('/', async(req, res) => {
	try {
		const createdQuestion = await Question.create(req.body)
		res.redirect('/');
	} catch(err) {
		res.send(err)
	}
})

module.exports = router;