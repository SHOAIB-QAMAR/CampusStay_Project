const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utility/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateListing, isOwner } = require("../middleware.js");

const listingController = require("../controller/listing.js");

const multer = require('multer');

const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

const multiUpload = upload.fields([
    { name: 'listing[image]', maxCount: 1 },
    { name: 'listing[menuImage]', maxCount: 1 }
]);

const checkLoggedInAndRedirect = (req, res, next) => {
    // If user is logged in, continue to show the listing
    if (req.isAuthenticated()) {
        return next();
    }

    // If user is NOT logged in:
    // 1. Save the original URL to redirect back after login
    req.session.originalUrl = req.originalUrl;

    // 2. Flash the message
    req.flash("error", "You need to log in to view listing details!");

    // 3. Redirect to login
    res.redirect("/login");
};

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, multiUpload, validateListing, wrapAsync(listingController.createListing));

router.get("/search", wrapAsync(listingController.searchListings));

router.get("/new", isLoggedIn, listingController.renderNewForm);

// router.route("/:id")
//     .get(wrapAsync(listingController.showListing))
//     .put(isLoggedIn, isOwner, multiUpload, validateListing, wrapAsync(listingController.updateListing))
//     .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.route("/:id")
    // Replace wrapAsync(listingController.showListing) with the new middleware chain
    .get(checkLoggedInAndRedirect, wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, multiUpload, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/menu", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listing/menu", { listing });
});

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
