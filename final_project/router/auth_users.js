const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = []

const isValid = username => {
  //returns boolean
  //write code to check is the username is valid
  let user = users.filter(user => user.username === username)
  if (!username) return false
  if (user.length > 0) return false
  return true
}

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  if (!username || !password) return false
  let user = users.filter(
    user => user.username === username && user.password === password
  )
  if (user.length > 0) return true
  return false
}

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' })
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password
      },
      'access',
      { expiresIn: 60 * 5 }
    ) // Every 5 minutes

    req.session.authorization = { accessToken, username }
    return res.status(200).json({ message: '¡User logged in successfully!' })
  } else {
    return res
      .status(208)
      .json({ message: '¡Invalid log in! check username or password' })
  }
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const ISBN = req.params.isbn // ISBN supplied by the request
  const user = req.session.authorization['username'] // Username from the user that's logged
  const { title, description } = req.body // Information for the review

  for (bookISBN in books) {
    if (bookISBN === ISBN) {
      let reviewExist = false
      Object.values(books[ISBN].reviews).map(review => {
        if (review.author === user) {
          review.title = title
          review.description = description
          reviewExist = true;
          return res.status(200).json({ message: 'Review successfully modified.' })
        }
      })
      // Creating review object
      if (!reviewExist) {
        let review = {
          author: user,
          title,
          description
        }
        let reviews = books[ISBN].reviews
        if (reviews.constructor.name === 'Array') {
          reviews.push(review)
          books[ISBN].reviews = reviews
          return res.status(200).json({ message: `${user}'s review successfully created` })
        } else {
          let reviewList = []
          if (Object.keys(reviews).length !== 0) {
            reviewList.push(reviews)
          }
          reviewList.push(review)
          books[bookISBN].reviews = reviewList
          return res.status(200).json({ message: `${user}'s review successfully created` })
        }
      }
    }
  }
  return res.status(404).json({ message: `Book with ISBN ${ISBN} not found.` })
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const ISBN = req.params.isbn
  const user = req.session.authorization['username']

  for (bookISBN in books) {
    // book exists on our database
    if (bookISBN === ISBN) {
      books[ISBN].reviews = Object.values(books[ISBN].reviews).filter((review) => review.author !== user);
      res.status(200).json({'message':'review deleted successfully'})
    }
  }
})

regd_users.get('/', (req, res) => {
  return res.status(200).send('Successfully logged in!')
})

module.exports = { isValid, users, authenticatedUser, regd_users }
