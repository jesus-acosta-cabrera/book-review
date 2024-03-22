// Importing libraries
const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').regd_users
const genl_routes = require('./router/general.js').general

// Initializing express
const app = express()

const PORT = 5000

// Auth
app.use('/customer', session({secret: 'fingerprint', resave: true,saveUninitialized: true}))
app.use(express.json())


// This is the middleware
app.use('/customer/auth/*', function auth (req, res, next) { 
  // Write the authenication mechanism here
  if (req.session.authorization) {
    token = req.session.authorization['accessToken']
    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        req.user = user
        next()
      } else {
        return res.status(403).json({
          message: 'User not authenticated'
        })
      }
    })
  } else {
    return res.status(403).json({
      message: 'User not logged in'
    })
  }
})

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => console.log('Server is running'))
