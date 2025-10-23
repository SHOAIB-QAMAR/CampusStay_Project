const User = require("../models/user");

// module.exports.renderSignupForm = (req, res) => {
//     res.render("users/signup.ejs");
// };

// module.exports.signup = async (req, res) => {
//     try {
//         let { username, email, password } = req.body;
//         const newUser = new User({ email, username });
//         const registeredUser = await User.register(newUser, password);
//         console.log(registeredUser);

//         req.login(registeredUser, function (err) {
//             if (err) {
//                 return next(err);
//             }
//             req.flash("success", "Welcome to Wanderlust!");
//             res.redirect("/listings");
//         });

//     } catch (e) {
//         req.flash("error", e.message);
//         res.redirect("/signup");
//     }
// };

module.exports.renderSignupForm = async (req, res) => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        res.render("users/signup", {
            showRoleSelection: !adminExists
        });
    } catch (error) {
        console.error("Error checking admin:", error);
        res.render("users/signup", { showRoleSelection: false });
    }
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, role = 'user' } = req.body;

        // If admin already exists, force role to 'user'
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists && role === 'admin') {
            req.flash("error", "Admin user already exists. Please sign up as a regular user.");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username, role });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.login(registeredUser, function (err) {
            if (err) {
                return next(err);
            }

            if (role === 'admin') {
                req.flash("success", `🎉 Welcome, System Administrator ${username}! You now have full management access.`);
                res.redirect("/admin/dashboard");
            } else {
                req.flash("success", "Welcome to Wanderlust!");
                res.redirect("/listings");
            }
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// module.exports.login = async (req, res) => {
//     req.flash("success", "Welcome back to Wanderlust!");
//     let redirectUrl = res.locals.redirectUrl || "/listings";
//     res.redirect(redirectUrl);
// };

module.exports.login = async (req, res, next) => {
    const { role } = req.body;

    console.log("Login attempt → form role:", role, " | user role:", req.user.role);

    if (role.toLowerCase() !== req.user.role.toLowerCase()) {
        req.logout(err => { if (err) return next(err); });
        req.flash("error", "Role mismatch! Please select the correct role.");
        return res.redirect("/login");
    }

    req.flash("success", `Welcome back, ${req.user.username}!`);
    if (req.user.role === "admin") {
        return res.send("/admin/dashboard");
    } else {
        return res.redirect("/listings");
    }
};



module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are successfully logged out!");
        res.redirect("/listings");
    })
};