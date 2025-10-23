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

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, multiUpload, validateListing, wrapAsync(listingController.createListing));

router.get("/search", wrapAsync(listingController.searchListings));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
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