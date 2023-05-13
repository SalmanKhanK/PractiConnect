const Joi = require('joi');

const userDetailsValidation = Joi.object({
    first_name: Joi.string().max(255),
    last_name: Joi.string().max(255),
    email: Joi.string().max(255).email(),
    bio: Joi.string().max(1000),
    profile_picture: Joi.string().max(1000),
    gender: Joi.string().valid('male', 'female', 'other'),

});

exports.userDetailsValidation = userDetailsValidation;