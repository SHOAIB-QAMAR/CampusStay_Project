const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync.js");
const { isAdmin } = require("../middleware.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/reviews.js");

// Admin Dashboard
router.get("/dashboard", isAdmin, wrapAsync(async (req, res) => {
    const listings = await Listing.find({}).populate("owner");
    const users = await User.find({});
    const reviews = await Review.find({}).populate("author");

    res.render("admin/dashboard", {
        listings,
        users,
        reviews,
        currentUser: req.user
    });
}));

// Admin Listings Management
router.get("/listings", isAdmin, wrapAsync(async (req, res) => {
    const listings = await Listing.find({}).populate("owner");
    res.render("admin/listings", { listings });
}));

// Delete Listing (Admin only)
router.delete("/listings/:id", isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    res.redirect("/admin/listings");
}));

// Admin Users Management
router.get("/users", isAdmin, wrapAsync(async (req, res) => {
    const users = await User.find({});
    res.render("admin/users", {
        users,
        currentUser: req.user // <--- This line fixes the error
    });
}));

// Admin Reviews Management
router.get("/reviews", isAdmin, wrapAsync(async (req, res) => {
    const reviews = await Review.find({})
        .populate("author")
        .populate("listing");
    res.render("admin/reviews", { reviews });
}));

// Delete User (Admin only)
router.delete("/users/:id", isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;

    // CRITICAL SECURITY CHECK: Prevent admin from deleting themselves
    if (req.user && req.user._id.equals(id)) {
        req.flash("error", "Cannot delete your own admin account!");
        return res.redirect("/admin/users");
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
        // Optional: delete associated data (e.g., listings, reviews)
        // await Listing.deleteMany({ owner: id }); 
        // await Review.deleteMany({ author: id });

        req.flash("success", `User (${deletedUser.username}) deleted successfully!`);
    } else {
        req.flash("error", "User not found.");
    }

    res.redirect("/admin/users");
}));

// Delete Review (Admin only)
router.delete("/reviews/:id", isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    req.flash("success", "Review deleted successfully");
    res.redirect("/admin/reviews");
}));

module.exports = router;