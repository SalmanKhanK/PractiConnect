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
      "cover_picture",
      "followers",
      "followings",
      "isAdmin"
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
          "cover_picture",
          "followers",
          "followings",
          "isAdmin"
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
  if(req.body.userId !== req.params.id){
    return res.status(404).send("Access denied!")
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

api.delete('/:id', async(req, res)=>{
   if(req.params.id === req.body.userId || req.body.isAdmin){
      try{
          await Users.findByIdAndDelete(req.params.id);
          return res.status(200).send("Account has been deleted!");
      }catch(er){
          return res.status(500).send("Internal server error");
      }
    }else{
        return res.status(403).send("You can delete only your account!");
    }
});

api.get("/:id", async(req,res)=>{
  try{
   const user = await Users.findById(req.params.id);
   const { password,updatedDate, ...rest } = user.toObject();
   res.status(200).send(rest);
  }catch(err){
    res.status(500).send("Internal server error");
  } 
});

api.post("/follow/:id", async(req,res)=>{
    if(req.body.userId !== req.params.id){
      try{
         const user = await Users.findById(req.params.id);
         const currentUser = await Users.findById(req.body.userId);
         if(!user.followers.includes(req.body.userId)){
            await user.updateOne({$push:{followers: req.body.userId}});
            await currentUser.updateOne({$push: {followings: req.params.id}});
            res.status(200).send("User has been followed!");
         }else{
            res.status(403).send("You already follow this user!");
         }
      }catch(err){
        res.status(500).send("internal server error")
      }
    }else{
       res.status(403).send("You can't follow yourself")
    }
});

api.post("/unfollow/:id", async(req,res)=>{
    if(req.body.userId !== req.params.id){
      try{
         const user = await Users.findById(req.params.id);
         const currentUser = await Users.findById(req.body.userId);
         if(user.followers.includes(req.body.userId)){
            await user.updateOne({$pull:{followers: req.body.userId}});
            await currentUser.updateOne({$pull: {followings: req.params.id}});
            res.status(200).send("User has been unfollowed!");
         }else{
            res.status(403).send("You don't follow this user!");
         }
      }catch(err){
        res.status(500).send("internal server error")
      }
    }else{
       res.status(403).send("You can't unfollow yourself")
    }
});
module.exports = api;
