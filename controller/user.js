const User = require("../models/user");

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

module.exports.becomeHost = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the current user
        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/listings");
        }

        // Check if user is already a landlord
        if (user.role === 'landlord') {
            req.flash("info", "You are already a host!");
            return res.redirect("/listings/new");
        }

        // Update user role to landlord
        user.role = 'landlord';
        await user.save();

        console.log(`User ${user.username} role updated to landlord`);

        req.flash("success", "🎉 Congratulations! You are now a host. You can now create listings.");
        res.redirect("/listings/new");

    } catch (error) {
        console.error("Error updating user role:", error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res, next) => {

    console.log("Login successful | user role:", req.user.role);

    req.flash("success", `Welcome back, ${req.user.username}!`);

    if (req.user.role === "admin") {
        return res.redirect("/admin/dashboard");
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
