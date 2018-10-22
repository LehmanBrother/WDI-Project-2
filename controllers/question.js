const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Vote = require('../models/vote');

//question vote post route
router.post('/:index', async (req, res) => {
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

module.exports = router;