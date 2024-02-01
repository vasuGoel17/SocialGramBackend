const mongoose = require("mongoose");
const Like = require("../models/LikeSchema");
const Save = require("../models/SaveSchema");
const Community = require("../models/CommunitySchema");
const UserCard = require("../models/UserCardSchema");
const Comment = require("../models/commentsSchema");

async function createLike(id) {
  try {
    const newLikeCard = new Like({ postId: id });
    const savedLikeCard = await newLikeCard.save();
    return { newLikeCard: savedLikeCard };
    // console.log(`UserCard created for ${username}`);
  } catch (error) {
    console.error("Error creating UserCard:", error);
  }
}

async function createComment(id) {
  try {
    const newCommentCard = new Comment({ postId: id });
    const savedCommentCard = await newCommentCard.save();
    return { newCommentCard: savedCommentCard };
    // console.log(`UserCard created for ${username}`);
  } catch (error) {
    console.error("Error creating commentcard:", error);
  }
}

async function createSave(username) {
  try {
    const newSaveCard = new Save({ username: username });
    const savedSaveCard = await newSaveCard.save();
    return { newSaveCard: savedSaveCard };

    // console.log(`UserCard created for ${username}`);
  } catch (error) {
    console.error("Error creating UserCard:", error);
    throw error;
  }
}

async function createCommunity(username) {
  try {
    const newCommunityCard = new Community({ username: username });
    const savedCommunityCard = await newCommunityCard.save();
    return { newCommunityCard: savedCommunityCard };

    // console.log(`UserCard created for ${username}`);
  } catch (error) {
    console.error("Error creating UserCard:", error);
  }
}

async function createUsercard(username, profilePhoto, day, month, year, time) {
  try {
    const newUsercard = new UserCard({
      username: username,
      profilePhoto: profilePhoto,
      day: day,
      month: month,
      year: year,
      time: time,
    });
    const savedUserCard = await newUsercard.save();
    return { newUserCard: savedUserCard };

    // console.log(`UserCard created for ${username}`);
  } catch (error) {
    console.error("Error creating UserCard:", error);
  }
}

module.exports = {
  createLike,
  createSave,
  createCommunity,
  createComment,
  createUsercard,
};
