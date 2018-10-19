const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');

const Article = require('./models/article');
const Comment = require('./models/comment');
const Question = require('./models/question');
const User = require('./models/user');

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
// app.use('/users', userController);

//home/index route
app.get('/', async (req, res) => {
	try {
		const allQuestions = await Question.find();
		res.render('index.ejs', {
			questions: allQuestions
		})
	} catch(err) {
		res.send(err);
	}
});

//new question route
app.get('/questions/new', async (req, res) => {
	res.render('questions/new.ejs');
})

app.listen(3000, () => {
	console.log('Server listening on port 3000');
})