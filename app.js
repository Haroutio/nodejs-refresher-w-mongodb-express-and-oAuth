const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

//Loading Config

dotenv.config({ path: './config/config.env' })

//Passport Config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//Handlebars Helpers
const { formatDate } = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', engine({
    helpers: {
        formatDate,
    },
    defaultLayout: 'main', extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
    secret: 'whatevs',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//Static Folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))