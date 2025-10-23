if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const passport = require("passport");
const LocalStratgy = require("passport-local");
const User = require("./models/user.js");

const ExpressError = require("./utility/ExpressError.js");

var session = require('express-session');
const MongoStore = require('connect-mongo');

const mongoose = require('mongoose');

const dbURl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbURl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
})

store.on("error", () => {
    console.log("Error in Mongo Session Store",err);
})

const sessionOption = {
    secret: "process.env.SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOption));

var flash = require('connect-flash');
app.use(flash());


app.use(passport.initialize());                       
app.use(passport.session());                          
passport.use(new LocalStratgy(User.authenticate())); 
passport.serializeUser(User.serializeUser());       
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");


app.get("/", (req, res) => res.redirect("/listings"));


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter);


main()
    .then(() => console.log("connection established"))
    .catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbURl);
};

const ejsMate = require('ejs-mate');
const { cookie } = require("express/lib/response.js");
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
})