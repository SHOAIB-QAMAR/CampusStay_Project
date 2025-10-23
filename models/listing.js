const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const { required } = require('joi');

const listingSchema = new Schema({
    title: {
        type: String,
        required:true
    },
    description: String,
    category: {
        type: String,
        enum: ["Trending", "Room","Single Seater", "Double Seater", "Dormitory", "Flat/Apartment", "Girls Hostel", "Boys Hostel", "Co-Living Space", "Economy", "Premium", "Room with Mess"],
        required:true
    },
    messAvailable: {
        type: String,
        enum: ["Vegetarian", "Non-Vegetarian", "Veg & Non-Veg", "None"],
        default: "None"
    },
    image: {
        url: {
            type: String,
            default: "https://media.istockphoto.com/id/1199844980/photo/small-bedroom-design-small-bed-and-study-and-office-desk-collocation.webp?a=1&b=1&s=612x612&w=0&k=20&c=LyP6KleqkD3zLTXgJ4cN8WhYG5sb2pIZcf18uHEIgbg=" // put your Cloudinary default URL here
        },
        filename: {
            type: String,
            default: "default"
        }
    }
,
    menuImage: {
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1515697320591-f3eb3566bc3c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // put your Cloudinary default URL here
        },
        filename: {
            type: String,
            default: "default"
        }
    },
    // price: Number,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: String,
    country: String,
    phone: {
        type: String,
        required: true,
        match: [/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"]
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

listingSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        console.log("Post middleware triggered. Deleting reviews:", doc.reviews);
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
