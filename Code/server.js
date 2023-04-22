// Load Node modules
let express = require('express');
let fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path'); // Import path module
const mongoose = require('mongoose'); // Import mongoose for MongoDB

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

const conn = "mongodb+srv://tomarad2001:2zTtcOVjDS7qOGI3@app.n3x0e0i.mongodb.net/?retryWrites=true&w=majority"

// Connect to MongoDB
mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

// Define schema for users
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

// Create user model
const User = mongoose.model('User', userSchema);

// Route for handling form submissions from the signup page
app.post('/signup', (req, res) => {
  // Retrieve user data from the request body
  const username = req.body.registerUsername;
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  let users = [];

  User.findOne({ $or: [{ username: username }, { email: email }] })
    .then((existingUser) => {
      if (existingUser) {
        // Send error response if username or email already exist
        res.status(404).send('Username or email already exists');
      } else {
        // Add the new user to the database
        const newUser = new User({ username, email, password });
        newUser.save()
          .then(() => {
            res.send("success");
          })
          .catch((err) => {
            console.error('Failed to save user:', err);
            res.status(500).send('Failed to save user');
          });
      }
    })
    .catch((err) => {
      console.error('Failed to find user:', err);
      res.status(500).send('Failed to find user');
    });
});

// Endpoint to handle login requests
app.post('/login', (req, res) => {
  const { loginUsername, loginPassword } = req.body; // Get login information from request body

  // Find user in MongoDB based on the provided username or email
  User.findOne({ $or: [{ username: loginUsername }, { email: loginUsername }] })
    .then((matchedUser) => {
      if (matchedUser && matchedUser.password === loginPassword) {
        // Login successful
        req.session.username = matchedUser.username;
        res.send("Login successful");
      } else {
        // Login failed
        if(matchedUser){
          res.status(401).send('Invalid password.');
        }
        else{
        res.status(401).send('username does not exist');
        }
      }
    })
    .catch((err) => {
      console.error('Failed to find user:', err);
      res.status(500).send('Failed to find user');
    });
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
  
  if(username == undefined){
    res.redirect('/login');
    }
  else{
  // Load JSON data from file
  const postList = require('./posts.json');

  // Render home page with username
  res.render('index.ejs', { username: username, posts: postList});
  }
});

app.get('/Trending', (req, res) => {
  if(req.session.username == undefined){
    res.redirect('/login')
  }
  else{
  res.render('Trending.ejs');
  }
});

app.get('/Challenges', (req, res) => {
  if(req.session.username == undefined){
    res.redirect('/login')
  }
  else{
  res.render('Challenges.ejs');
  }
});

app.get('/Friends', (req, res) => {
  if(req.session.username == undefined){
    res.redirect('/login')
  }
  else{
  res.render('Friends.ejs');
  }
});

app.get('/Profile', (req, res) => {
  if(req.session.username == undefined){
    res.redirect('/login')
  }
  else{
  res.render('Profile.ejs');
  }
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