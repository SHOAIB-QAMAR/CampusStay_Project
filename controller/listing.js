const Listing = require("../models/listing");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let query = {};

    // Category filter
    if (category) {
        query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
            query.price.$gte = parseInt(minPrice);
        }
        if (maxPrice) {
            query.price.$lte = parseInt(maxPrice);
        }
    }

    // Always sort by price in ascending order
    const allListings = await Listing.find(query).sort({ price: 1 });

    res.render("listing/index.ejs", {
        allListings,
        selectedCategory: category,
        selectedMinPrice: minPrice || '',
        selectedMaxPrice: maxPrice || ''
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: `${req.body.listing.location}, ${req.body.listing.country}`,
            limit: 1
        })
        .send();

    const newListing = new Listing(req.body.listing);
    // While saving listing ensure owner also saved
    newListing.owner = req.user._id;

    if (req.body.listing.phone) {
        newListing.phone = req.body.listing.phone;
    }

    // ✅ Handle main image
    if (req.files['listing[image]']) {
        newListing.image = {
            url: req.files['listing[image]'][0].path,
            filename: req.files['listing[image]'][0].filename
        };
    }

    // ✅ Handle menu image
    if (req.files['listing[menuImage]']) {
        newListing.menuImage = {
            url: req.files['listing[menuImage]'][0].path,
            filename: req.files['listing[menuImage]'][0].filename
        };
    }

    // Coordinate Saving
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New Listings Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/ar_4:3,c_fill,g_auto,w_600,h_450,r_20,e_shadow:30,bo_1px_solid_silver,q_auto,f_auto");
    res.render("listing/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    listing.set(req.body.listing);

    if (req.body.listing.phone) {
        listing.phone = req.body.listing.phone;
    }

    if (req.files['listing[image]']) {
        listing.image = {
            url: req.files['listing[image]'][0].path,
            filename: req.files['listing[image]'][0].filename
        };
    }

    if (listing.category === "Room with Mess" && req.files['listing[menuImage]']) {
        listing.menuImage = {
            url: req.files['listing[menuImage]'][0].path,
            filename: req.files['listing[menuImage]'][0].filename
        };
    }

    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    console.log("Deleted listing in route:", deletedListing);
    req.flash("success", "Listings deleted!");
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { country: { $regex: q, $options: 'i' } }
        ]
    });
    if (allListings.length === 0) {
        req.flash("error", "Destination you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listing/index.ejs", { allListings });
};