const express = require('express');
const router = express.Router();
const Article = require('../models/article')
const Comment = require('../models/comment');
const Question = require('../models/question');
const User = require('../models/user');

// New route
router.get('/new', async (req, res) => {
	res.render('article/new.ejs')
})

// Create Article Route
router.post('/:questionId', async (req, res) => {
	
})