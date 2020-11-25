const express = require('express');
const app = express();

require('dotenv').config();
const connect = require('./models/db/db');

const userRouters = require('./routes/userRoutes');
const profileRouters = require('./routes/profileRoutes');
const postRouters = require('./routes/postRoutes');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('express-flash');
const PORT = process.env.PORT || 5000;

// Establish DB connection 
connect();
// Express session middleware
const store = new MongoDBStore({
    uri: process.env.DB,
    collection: 'sessions'
});

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store : store
  }));

// Flash middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.message = req.flash();
    next();
})  

// Load Static files
app.use(express.static('./views'));
app.use(express.urlencoded({extended: true}));
// Set view engine
app.set('view engine', 'ejs');

app.use(userRouters);
app.use(profileRouters);
app.use(postRouters);


app.listen(PORT, () => {
    console.log(`server is now up on port: ${PORT}`);
})

