const express = require('express');
const app = express();
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
// app.use('/articles', articleController);
// app.use('/comments', commentController);
app.use('/questions', questionController);
app.use('/users', userController);

//home/index route
app.get('/', async (req, res) => {
	try {
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

//new question route
app.get('/questions/new', async (req, res) => {
	if(req.session.logged) {
		req.session.message = undefined;
		res.render('questions/new.ejs', {
			username: req.session.username,
			message: req.session.message
		});
	} else {
		req.session.message = 'You must be logged in to post a question.';
		res.redirect('/');
	}
})

// Show Route
app.get('/questions/:index', (req, res) => {
	Question.findById(req.params.index, (err, foundQuestion) => {
		res.render('questions/show.ejs', {
			question: foundQuestion,
			username: req.session.username,
			message: req.session.message
		});
	});
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
				voteBalance: newVote.value
			});
			newQuestion.votes.push(newVote);
			newQuestion.save();
		} catch(err) {
			res.send(err);
		}
	}
	res.redirect('/');
})

app.listen(3000, () => {
	console.log('Server listening on port 3000');
})