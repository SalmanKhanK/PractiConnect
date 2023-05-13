const express = require("express");
const api = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Users, validateUser } = require("../models/users");
const { userDetailsValidation } = require("../utils/validation");

api.post("/create", async (req, res) => {
  const { error } = validateUser.validate(req.body);
  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ errors });
  }
  const isUserExist = await Users.findOne({ email: req.body.email });
  if (isUserExist) return res.status(400).send("Email already exist");

  const user = new Users(
    _.pick(req.body, [
      "first_name",
      "last_name",
      "email",
      "password",
      "bio",
      "gender",
      "profile_picture",
    ])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  try {
    await user.save();
    res
      .status(200)
      .send(
        _.pick(user, [
          "_id",
          "first_name",
          "last_name",
          "email",
          "gender",
          "bio",
          "profile_picture",
        ])
      );
  } catch (er) {
    console.log(er, "err");
  }
});

api.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Incorrect email or password");

  const userPassword = await bcrypt.compare(req.body.password, user.password);
  if (!userPassword) return res.status(400).send("Incorrect email or password");
  const { password, ...rest } = user.toObject();
  res.status(200).send(rest);
});

api.put("/update-user/:id", async (req, res) => {
  const { error } = userDetailsValidation.validate(req.body);
  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ errors });
  }

  try {
    const user = await Users.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User with the given ID was not found");
    }
    const { password, ...rest } = user.toObject();
    res.send(rest);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = api;
