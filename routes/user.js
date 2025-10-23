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

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        async (req, res) => {
            const { role } = req.body; // Get role from form data
            const user = req.user; // Now user is available after authentication

            console.log("Selected role:", role);
            console.log("User role:", user.role);

            // Check if role matches
            if (user.role !== role) {
                req.logout((err) => {
                    if (err) {
                        console.error("Logout error:", err);
                    }
                    req.flash("error", "Role mismatch! Please select the correct role.");
                    return res.redirect("/login");
                });
                return;
            }

            req.flash("success", `Welcome back, ${user.username}!`);

            // Redirect based on role
            if (user.role === "admin") {
                return res.redirect("/admin/dashboard");
            } else {
                const redirectUrl = res.locals.redirectUrl || "/listings";
                return res.redirect(redirectUrl);
            }
        }
);
    
router.get("/logout", userController.logout);

module.exports = router;