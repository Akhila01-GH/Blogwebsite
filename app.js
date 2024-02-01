const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/blogDB');

const db = mongoose.connection;

// Event handlers for MongoDB connection events
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Create Post schema
const postSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Post = mongoose.model('Post', postSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getPosts', (req, res) => {
    // Retrieve posts from the database
    Post.find({}, (err, posts) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(posts);
            res.send(posts);
        }
    });
});

app.post('/addPost', (req, res) => {
    console.log('Received request to add post:', req.body);

    // Add a new post to the database
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content
    });

    newPost.save((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Post added successfully');
            res.status(200).send('Post added successfully');
        }
    });
});

app.post('/deletePost', (req, res) => {
    // Delete a post from the database
    const postId = req.body.postId;

    Post.findByIdAndRemove(postId, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

// Serve the main HTML file
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
