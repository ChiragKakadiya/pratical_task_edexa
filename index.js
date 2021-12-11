const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel')
const routes = require('./routes/route.js');

require("dotenv").config({});

const app = express();
const PORT = process.env.PORT || 3000;

//  Connect mongoDB database through mongoose
mongoose.connect('mongodb://' + (process.env.HOST || 'localhost') + ':' + (process.env.MONGODB_PORT || 27017) + '/' + (process.env.DB_NAME || 'admin'))
  .then(() => {
    console.log('Connected to the Database successfully');
  });

//  Parse incoming request body in a middleware before handlers, available under the req.body property
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  // Chekc that if in header "x-access-token" is set or not for verify accessToken
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.send({
        type: "error",
        message: "JWT token has expired, please login to obtain a new one"
      });
    }
    //  Store user data into session
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    type: "error",
    message: "This route is not exist."
  });
});

app.use('/', routes); app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT)
})