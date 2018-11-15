const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');

const Article = require('./models/article');
const Comment = require('./models/comment');
const Question = require('./models/question');
const User = require('./models/user');
const Vote = require('./models/vote');

const articleController = require('./controllers/article');
const commentController = require('./controllers/comment');
const questionController = require('./controllers/question');
const userController = require('./controllers/user');

require('./db/db');

//Middleware
app.use(session({
	secret: 'stuff, I guess',
	resave: false,
	saveUninitialized: false
}))
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(express.static('public'));

//Controllers
app.use('/questions', questionController);
app.use('/users', userController);

// Login Get Route
app.get('/login', (req, res) => {
	res.render('user/login.ejs')
})

// post route
app.post('/', async(req, res) => {
	try {
		const createdQuestion = await Question.create(req.body)
		res.redirect('/');
	} catch(err) {
		res.send(err)
	}
})


//home/index route (default)
app.get('/', async (req, res) => {
	try {
		req.session.message = undefined;
		const allQuestions = await Question.find();
		res.render('index.ejs', {
			questions: allQuestions,
			username: req.session.username,
			message: req.session.message
		})
	} catch(err) {
		res.send(err);
	}
});

//home/index route (new)
app.get('/new', async (req, res) => {
	try {
		req.session.message = undefined;
		const allQuestions = await Question.find().sort({created_at: 'desc'});
		res.render('index.ejs', {
			questions: allQuestions,
			username: req.session.username,
			message: req.session.message
		})
	} catch(err) {
		res.send(err);
	}
});

//home/index route (popular)
app.get('/popular', async (req, res) => {
	try {
		req.session.message = undefined;
		const allQuestions = await Question.find().sort({voteCount: 'desc'});
		res.render('index.ejs', {
			questions: allQuestions,
			username: req.session.username,
			message: req.session.message
		})
	} catch(err) {
		res.send(err);
	}
});

//home/index route (controversial)
app.get('/controversial', async (req, res) => {
	try {
		req.session.message = undefined;
		const allQuestions = await Question.find().sort({voteControversy: 'desc'});
		res.render('index.ejs', {
			questions: allQuestions,
			username: req.session.username,
			message: req.session.message
		})
	} catch(err) {
		res.send(err);
	}
});

//new question route
<<<<<<< HEAD
app.get('/questions/new', (req, res) => {
	res.render('questions/new.ejs');
=======
app.get('/questions/new', async (req, res) => {
	if(req.session.logged) {
		req.session.message = undefined;
		res.render('questions/new.ejs', {
			username: req.session.username,
			message: req.session.message
		});
	} else {
		req.session.message = 'You must be logged in to post a question.';
		const allQuestions = await Question.find();
		res.render('index.ejs', {
			questions: allQuestions,
			username: req.session.username,
			message: req.session.message
		});
	}
})

// Show Route
app.get('/questions/:index', async (req, res) => {
	try {
		foundQuestion = await Question.findById(req.params.index);
		foundVotes = foundQuestion.votes;
		let strongDis = 0;
		let somewhatDis = 0;
		let neutral = 0;
		let somewhatA = 0;
		let strongA = 0;
		for(let i = 0; i < foundVotes.length; i++){
			if(foundVotes[i].value === 1){
				strongDis += 1
			} else if(foundVotes[i].value === 2) {
				somewhatDis += 1
			} else if(foundVotes[i].value === 3) {
				neutral += 1
			} else if (foundVotes[i].value === 4) {
				somewhatA += 1
			} else if(foundVotes[i].value === 5) {
				strongA += 1
			}
		}
		const voteValues = [strongDis, somewhatDis, neutral, somewhatA, strongA]
		res.render('questions/show.ejs', {
			question: foundQuestion,
			votes: voteValues,
			username: req.session.username,
			message: req.session.message
		});	
	} catch(err) {
		console.log(err);
	}
});

//question post route
app.post('/', async (req, res) => {
	console.log(req.body);
	if(req.session.logged) {
		try {
			console.log(req.session);
			const newVote = await Vote.create({
				username: [req.session.username],
				value: Number(req.body.vote)
			})
			const newQuestion = await Question.create({
				briefDesc: req.body.briefDesc,
				fullDesc: req.body.fullDesc,
				img: req.body.img,
				username: req.session.username,
				voteCount: 1,
				voteBalance: newVote.value
			});
			newQuestion.votes.push(newVote);
			newQuestion.save();
			res.redirect('/');
		} catch(err) {
			res.send(err);
		}
	}
>>>>>>> f31acfbca80247215f49c9d1099eae1493bc61b5
})

app.listen(PORT, () => {
	console.log('Server listening on port ' + PORT);
})