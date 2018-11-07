const express = require('express');
const router = express.Router();
const User = require('../models/user');




// Login Post route
router.post('/', async (req, res) => {
	const userEntry = {};
	userEntry.username = req.body.username;
	userEntry.password = req.body.password;
	userEntry.questions = []
	userEntry.comments = []
	userEntry.articles = []

	const user = User.create(userEntry)
	req.session.username = req.body.username
	req.session.logged = true;
	res.redirect('/')
})




module.exports = router;