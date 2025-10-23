const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utility/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const ExpressError = require("../utility/ExpressError.js");

const userController = require("../controller/user.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.get("/become-host",
    saveRedirectUrl,
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in to become a host!");
            return res.redirect("/login");
        }
        next();
    },
    wrapAsync(userController.becomeHost)
);

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        // Custom callback to handle user not found
        (req, res, next) => {
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    return next(err);
                }
                
                // If user not found, flash register message
                if (!user) {
                    req.flash("error", "User not found! Please register first.");
                    return res.redirect("/signup");
                }
                
                // If user exists, proceed with login
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    
                    console.log("Login successful. User role:", user.role);
                    req.flash("success", `Welcome back, ${user.username}!`);
                    
                    let redirectUrl = res.locals.redirectUrl || "/listings"; 
                    if (user.role === "admin") {
                        redirectUrl = "/admin/dashboard";
                    }
                    
                    return res.redirect(redirectUrl);
                });
                
            })(req, res, next);
        }
    );
    
router.get("/logout", userController.logout);

module.exports = router;
