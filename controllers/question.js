const express = require('express');
const router = express.Router();
const Question = require('../models/question');

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