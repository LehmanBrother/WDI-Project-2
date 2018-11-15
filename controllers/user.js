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

const bcrypt = require('bcrypt');

//login page
router.get('/login', (req, res) => {
	console.log(req.session);
	req.session.message = undefined;
	res.render('users/login.ejs', {
		username: req.session.username,
		message: req.session.message
	});
})

//register post route
router.post('/register', async (req, res) => {
	//will need to implement logic here to make sure username is unique...maybe already accomplished by user model, but will still need message
	const password = req.body.password;
	const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
	console.log(passwordHash);
	const userEntry = {};
	userEntry.username = req.body.username;
	userEntry.password = passwordHash;
	const user = await User.create(userEntry);
	console.log(user);
	req.session.username = req.body.username;
	req.session.logged = true;
	req.session.message = undefined;
	res.redirect('/');
})

//login post route
router.post('/login', async (req, res) => {
	try {
		const foundUser = await User.findOne({username: req.body.username});
		console.log(foundUser);
		if(foundUser) {
			if(bcrypt.compareSync(req.body.password, foundUser.password)) {
				req.session.username = req.body.username;
				req.session.logged = true;
				req.session.message = undefined;
				console.log('Login successful');
				res.redirect('/');
			} else {
				req.session.message = 'Username or password not found in system.'
				console.log('Invalid password');
				res.redirect('/users/login');
			}
		} else {
			req.session.message = 'Username or password not found in system.'
			console.log('Invalid username');
			res.redirect('/users/login');
		}
	} catch(err) {
		res.send(err);
	}
})

//logout route
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if(err) {
			res.send(err);
		} else {
			console.log('Logout successful');
			res.redirect('/');
		}
	})
})

module.exports = router;