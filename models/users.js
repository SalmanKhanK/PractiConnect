const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    first_name: {
       type: String,
       maxlength: 255,
       required: true,
       trim: true,
    },
    last_name: {
       type: String,
       maxlength: 255,
       required: true,
       trim: true,
    },
    email: {
       type: String,
       maxlength: 255,
       required: true,
       unique: true,
    },
    password: {
       type: String,
       maxlength: 255,
       required: true,
    },
});

userSchema.add({
    bio: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    profile_picture: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
  });

const Users = mongoose.model('Users', userSchema);

const validateUser = Joi.object({
    first_name: Joi.string().max(255).required(),
    last_name: Joi.string().max(255).required(),
    email: Joi.string().max(255).email().required(),
    password: Joi.string().max(255).required(),
    bio: Joi.string().max(1000),
    profile_picture: Joi.string().max(1000),
    gender: Joi.string().valid('male', 'female', 'other'),

});

exports.Users = Users;
exports.validateUser = validateUser;
