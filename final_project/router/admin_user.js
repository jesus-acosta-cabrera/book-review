const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb");
const users = require("./auth_users").users;
const admin_users = express.Router();

function authenticatedUser(username, password) {
  if (!username || !password) return false;
  let user = users.filter(
    (user) =>
      user.username === username &&
      user.password === password &&
      user.type === "admin"
  );

  if (user.length > 0) return true;
  return false;
}

admin_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "admin",
      { expiresIn: 60 * 5 }
    ); // Every 5 minutes

    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "¡User logged in successfully!" });
  } else {
    return res
      .status(208)
      .json({ message: "¡Invalid log in! check username or password" });
  }
});
// Create book
admin_users.post("/auth/add", (req, res) => {
  // Normal Route
  const { isbn, author, title } = req.body;
  let exists = Object.keys(books).filter(keys => keys == isbn)
  if(exists.length > 0){
    return res.status(404).json({message:"That book already exists"})
  }else{
    if (isbn && author && title) {
      books[isbn] = { author, title, reviews: {} };
      return res.status(200).json({ message: "Book Created." });
    }
    // Missing author
    if (!author && isbn && title) {
      books[isbn] = { author: "Unknown", title, reviews: {} };
      return res.status(200).json({ message: "Book Created. Author unknown" });
    }
    // Missing title or isbn
    if (!isbn || !title) {
      return res.status(404).json({ message: "Missing ISBN or Title" });
    }
  }
});

// Edit Book
admin_users.put("/auth/modify", (req, res) => {
  const { isbn, author, title } = req.body;
  if (isbn) {
    if(author && title){
      books[isbn].author = author;
      books[isbn].title = title;
      return res.status(200).json({message:"Book Modified!"})
    }
    if (author) {
      books[isbn].author = author;
      return res.status(200).json({ Message: "Book Modified" });
    }
    if (title) {
      books[isbn].title = title;
      return res.status(200).json({ message: "Book Modified" });
    }
    return res.status(404).json({"message":"Missing author and title parameters"});
  }else{
    return res.status(404).json({"message":"Missing book ISBN"})
  }
});

// Delete Book

admin_users.delete("/auth/remove", (req, res) => {
  const { isbn } = req.body;
  let bookList = {};
  let exist = false;
  // ISBN exists
  if (isbn) {
    for (key in books) {
      if (key == isbn) {
        exist = true;
      } else {
        bookList[key] = books[key];
      }
    }
    if (exist) {
      delete books[isbn];
      return res.status(200).json({ message: "Book deleted" });
    }
  }
  return res.status(404).json({ message: "Book doesn't exist!" });
});

module.exports = { admin_users };
