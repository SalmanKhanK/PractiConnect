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
},{
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate'
  }
});

userSchema.add({
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    profile_picture: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
  });
userSchema.add({
  cover_picture: {
    type: String,
    default: "",
  },
  followers: {
    type: Array,
    default: [],
  },
  followings: {
    type: Array,
    default:[],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }
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
    cover_picture: Joi.string().max(1000),
    followers: Joi.array(),
    followings: Joi.array(),
    isAdmin: Joi.boolean()
});

exports.Users = Users;
exports.validateUser = validateUser;
