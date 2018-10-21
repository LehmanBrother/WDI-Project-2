const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

//login page
router.get('/login', (req, res) => {
	console.log(req.session);
	res.render('users/login.ejs', {
		message: req.session.message
	});
})

//register post route
router.post('/register', async (req, res) => {
	//will need to implement logic here to make sure username is unique
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
	req.session.message = '';
	res.redirect('/');
})

//login post route
router.post('/login', async (req, res) => {
	try {
		const foundUser = await User.findOne({username: req.body.username});
		console.log(foundUser);
		if(foundUser) {
			if(bcrypt.compareSync(req.body.password, foundUser.password)) {
				req.session.logged = true;
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

//login route
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if(err) {
			res.send(err);
		} else {
			res.redirect('/users/login');
		}
	})
})

module.exports = router;