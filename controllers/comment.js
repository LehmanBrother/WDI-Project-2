const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Question = require('../models/question');
const User = require('../models/user');
const Article = require('../models/article')

// Comment New Route
router.get('/:index/new', async(req, res) => {
	const foundQuestion = await Question.findById(req.params.index)
	res.render('/comments/new.ejs', {
		question: foundQuestion
	})
})

// Comment create Route
router.post('/:questionId', async (req, res) => {
	try {
		const questionComment = await Comment.create(req.body);
		const foundQuestion = await Question.findById(req.params.questionId);
		const foundUser = await User.findOne({name: req.body.user});
		foundQuestion.comment.push(questionComment);
		foundUser.comment.push(questionComment);
		await foundQuestion.save();
		await foundUser.save();
		res.redirect('/');
	} catch(err) {
		res.send(err);
	}
})

// router.post('/:articleId', async (req, res) => {
// 	try {
// 		const articleComment = await Comment.create(req.body);
// 		const foundArticle = await Article.findById(req.params.articleId);
// 		const foundUser = await User.findOne({name: req.body.user});
// 		foundArticle.comment.push(articleComment);
// 		foundUser.comment.push(articleComment);
// 		await foundArticle.save();
// 		await foundUser.save();
// 		res.redirect('/')
// 	} catch(err) {
// 		res.send(err);
// 	}
// })



module.exports = router;