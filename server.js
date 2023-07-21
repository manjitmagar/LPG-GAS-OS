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
const Emitter = require('events')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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

//Event Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)





// Session Config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 100 * 60 * 60 * 24 }, //~24hrs
  })
)

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(async function (user, cb) {
  // const user = await User.findById(id);
  cb(null, user);
});

//passport config 
const passportInit = require('./app/config/passport')
const User = require('./app/models/user')
const bcrypt = require('bcrypt')
passportInit(passport)
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: "546013726625-klonbmc2pm5c9s5d701v5cof75isilfk.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      const name = profile.displayName;
      const email = profile.emails[0].value;
      const hashedPassword = await bcrypt.hash("123", 10);

      User.findOne({
        email : email
      }).then((data, err) => {
        if( data ){
          cb(null, data);
        }else{
          const storeuser = new User({
            email : email,
            password : hashedPassword,
            name : name
          });

          storeuser.save().then(() => {
            cb(null, storeuser);
          }).catch((err) => {
            cb(err);
          })
        }
      })
    }
  )
);


app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);


app.use(flash())

// Assets
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use("/public/", express.static("./public"))
app.use(express.json())

//Global Midalware
app.use((req, res, next) => {
  res.locals.session = req.session

  res.locals.user = req.user
  next()
})




// Set Template Engine
app.use(expressLayout)
app.set("views", path.join(__dirname, "/resources/views"))
app.set("view engine", "ejs")

// Routes
require("./routes/web")(app)

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

//socket 
const io = require('socket.io')(server)
io.on('connection', (socket) => {
  //join

  socket.on('join', (orderId) => {

    socket.join(orderId)

  })

})
eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
  io.to('adminRoom').emit('orderPlaced', data)

})


