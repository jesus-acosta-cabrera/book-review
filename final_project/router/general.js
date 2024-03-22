const express = require('express')
const axios = require('axios')
let books = require('./booksdb.js')
let { isValid, authenticatedUser, users } = require('./auth_users.js')
const public_users = express.Router()

//Write your code here
public_users.post('/register', (req, res) => {
  // Obtain username & password from request body
  const { username, password } = req.body

  // Checking if username isn't stored on database
  if (isValid(username)) {
    // Adding username to database
    users.push({ username, password })
    // Response for client (User created)
    return res.status(200).json({
      message: '¡User registered successfully!'
    })
  } else {
    // Response for client (Username exists)
    return res.status(404).json({
      message: '¡User already exists!'
    })
  }
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let bookList = {}
  // Iterating through all books
  for (i in books) {
    bookList[i] = books[i].title
  }
  // Response for client
  return res.status(200).json(bookList)
})

const getAllBooks = () => {
  const req = axios.get('http://localhost:5000/')
  req
    .then(resp => {
      console.log(resp.data)
    })
    .catch(err => {
      console.log('an error occurred')
    })
}

const getBooksbyISBN = () => {
  const req = axios.get('http://localhost:5000/isbn/1')
  req
    .then(resp => {
      console.log(resp.data)
    })
    .catch(err => {
      console.log('an error occurred')
    })
}

const getBooksbyAuthor = () => {
  const req = axios.get('http://localhost:5000/author/Chinua Achebe')
  req
    .then(resp => {
      console.log(resp.data)
    })
    .catch(err => {
      console.log('an error occurred')
    })
}

const getBooksbyZTitle = () => {
  const req = axios.get('http://localhost:5000/title/Things Fall Apart')
  req
    .then(resp => {
      console.log(resp.data)
    })
    .catch(err => {
      console.log('an error occurred')
    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Obtaining ISBN from parameter
  const ISBN = req.params.isbn
  let book = []
  for (bookISBN in books) {
    if (bookISBN === ISBN) {
      book.push({
        author: books[bookISBN].author,
        title: books[bookISBN].title
      })
    }
  }
  // If we found a book, send it to client
  if (book.length > 0) {
    return res.status(200).json(book)
  } else {
    // If we don't find a book, notify the client
    return res
      .status(404)
      .json({ message: `The book with ISBN ${ISBN} doesn't exist` })
  }
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Obtaining author from parameter
  const author = req.params.author
  let bookList = []
  for (ISBN in books) {
    if (books[ISBN].author === author) {
      bookList.push({
        author: books[ISBN].author,
        title: books[ISBN].title
      })
    }
  }
  // Author exists
  if (bookList.length > 0) {
    // Give client the books written by the author
    return res.status(200).json(bookList)
  } else {
    // The author doesn't exist
    // Notify the client author doesn't exist
    return res
      .status(404)
      .json({ message: `¡The author ${author} doesn't exist!` })
  }
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Obtaining book title from parameter
  const title = req.params.title
  let bookList = []
  for (i in books) {
    if (books[i].title === title)
      bookList.push({
        author: books[ISBN].author,
        title: books[ISBN].title
      })
  }
  if (bookList.length > 0) {
    return res.status(200).json(bookList)
  } else {
    return res
      .status(404)
      .json({ message: `¡Book with title ${title} doesn't exist!` })
  }
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const ISBN = req.params.isbn
  for (bookISBN in books) {
    if (bookISBN === ISBN) {
      let reviews = books[bookISBN].reviews
      return res.status(200).json(reviews)
    }
  }
  return res.status(404).json({ message: `Book with ISBN ${ISBN} not found.` })
})

module.exports.general = public_users
