const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().valid("Trending", "Room","Single Seater", "Double Seater", "Triple Sharing", "Dormitory", "Studio Apartment", "Flat/Apartment", "Girls Hostel", "Boys Hostel", "Co-Living Space", "Economy", "Premium", "Room with Mess").required(),
        messAvailable: Joi.string().valid("Vegetarian", "Non-Vegetarian", "Veg & Non-Veg", "None").default("None"),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow(null),
        menuImage: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow(null),
        phone: Joi.string()
            .pattern(/^\+?[0-9]{10,15}$/)
            .required()
            .messages({
                "string.pattern.base": "Phone number must be valid (10 digit)."
        }),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});