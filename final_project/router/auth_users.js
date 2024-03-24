const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const isUserPresent = users.some((obj) =>
    Object.values(obj).includes(username)
  );
  return isUserPresent;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return !!user;
};

regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  
  // check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Please provide both username and password."});
  }

  // check if user is registered
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({message: "Invalid credentials."});
  }

  // check if password is correct
  if (user.password !== password) {
    return res.status(401).json({message: "Invalid credentials."});
  }

  // generate JWT token
  const accessToken = jwt.sign({ username: user.username }, 'your_secret_key');

  // save token in session
  req.session.accessToken = accessToken;

  // return success message with access token
  return res.json({message: "Login successful.", accessToken});
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;
  const review = req.query.review;
  console.log(username);
  if (!review) {
    return res.status(400).json({message: "Please provide a review"});
  }
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.json({message: "Review modified successfully"});
  }
  books[isbn].reviews[username] = review;
  return res.json({message: "Review added successfully"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;
  //const user = req.body.username;
  console.log(isbn);

  if (!username) {
    return res.status(401).json({message: "Unauthorized"});
  }

  if (!isValid(username)) {
    return res.status(401).json({message: "Invalid username"});
  }

  if (!books[isbn]) {
    return res.status(400).json({message: "Invalid ISBN"});
  }

  if (!books[isbn].reviews[username]) {
    return res.status(400).json({message: "Review not found for the given ISBN and username"});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({message: "Review deleted successfully"});
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
