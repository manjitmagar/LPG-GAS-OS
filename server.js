require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const passport = require('passport')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)

//Database Connection
mongoose
  .connect(
    "mongodb+srv://arpannacharya:MAqrURSKEzpAaEUm@cluster0.iobbe1z.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });







// Session Store
const mongoStore = new MongoDbStore({
  mongooseConnection: mongoose.connection,
  collection: 'sessions'
})

// Session Config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 100 * 60 * 60*24 }, //~24hrs
  })
)




//passport config 
const passportInit =require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize());
app.use(passport.session());




app.use(flash())

// Assets
app.use(express.static("public"))
app.use(express.urlencoded({extended:false}))
app.use("/public/", express.static("./public"))
app.use(express.json())

//Global Midalware
app.use(( req,res,next)=>{
res.locals.session=req.session

res.locals.user=req.user
next()
})




// Set Template Engine
app.use(expressLayout)
app.set("views", path.join(__dirname, "/resources/views"))
app.set("view engine", "ejs")

// Routes
require("./routes/web")(app)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


