// Load Node modules
let express = require('express');
let fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path'); // Import path module

// Initialise Express
var app = express();
// Render static files
app.set('view engine', 'ejs');
app.use(express.static('views'));

// Generate a random secret string
const secret = crypto.randomBytes(64).toString('hex');

// Set up body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: secret, // replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Route for handling form submissions from the signup page
app.post('/signup', (req, res) => {
  // Retrieve user data from the request body
  const username = req.body.registerUsername;
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  let users = [];

  // Read from the JSON file
  const readData = fs.readFileSync('users.json');
  if(readData && readData.length > 0){
    users = JSON.parse(readData);
  }

  const existingUsername = users.find(user => user.username === username);
  const existingEmail = users.find(user => user.email === email);
  if (existingUsername) {
    // Send error response if username or email already exist
    res.status(404).send('Username already exists');
  }
  else if(existingEmail){
    res.status(404).send('Email already exists');
  }
  else{
  // Add the new user to the array
  res.send("success");
  const newUser = { username, email, password };
  users.push(newUser);

  // Write to the JSON file
  fs.writeFileSync('users.json', JSON.stringify(users));
  }
});

// Endpoint to handle login requests
app.post('/login', (req, res) => {
  const { loginUsername, loginPassword } = req.body; // Get login information from request body

  console.log({ loginUsername, loginPassword });

  // Delete the users module from the cache
  delete require.cache[require.resolve('./users.json')];

  // Load JSON data from file
  const users = require('./users.json');

  console.log(users);

  // Check if login information matches a record in the JSON data
  const matchedUser = users.find(user => (user.username === loginUsername || user.email === loginUsername) && user.password === loginPassword);

  if (matchedUser) {
    // Login successful
    req.session.username = matchedUser.username;

    res.send("login successful");
  } else {
    // Login failed
    res.status(401).send('Invalid username or password.');
  }
});

// Navigate to create post page when create button clicked
app.post('/goToCreatePost', (req, res) => {
  res.render('CreatePost.ejs');
});

app.post('/createPost', (req, res) => {
  let posts = []
  const exercise = req.body.exercise;
  const description = req.body.description;
  const username = req.session.username;

  const readDataPosts = fs.readFileSync('posts.json');

  if(readDataPosts && readDataPosts.length > 0){
    posts = JSON.parse(readDataPosts);
  }

  const newPost = { exercise, description, username };
  posts.unshift(newPost);

  // Write to the JSON file
  fs.writeFileSync('posts.json', JSON.stringify(posts));

  // Delete the posts module from the cache
  delete require.cache[require.resolve('./posts.json')];

  res.redirect('/');
});

app.get('/', (req, res) => {
  // Access username from session
  const username = req.session.username;

  // Load JSON data from file
  const postList = require('./posts.json');

  // Render home page with username
  res.render('index.ejs', { username: username, posts: postList});
});

app.get('/Trending', (req, res) => {
  // Render home page with username
  res.render('Trending.ejs');
});

app.get('/Challenges', (req, res) => {
  // Render home page with username
  res.render('Challenges.ejs');
});

app.get('/Friends', (req, res) => {
  // Render home page with username
  res.render('Friends.ejs');
});

app.get('/Profile', (req, res) => {
  // Render home page with username
  res.render('Profile.ejs');
});

app.get('/SignUp', (req, res) => {
  // Render home page with username
  res.render('SignUp.ejs');
});

app.get('/Login', (req, res) => {
  // Render home page with username
  res.render('Login.ejs');
});


// Port website will run on
app.listen(3000,() => {
    console.log('Server is running on http://localhost:3000');
  });