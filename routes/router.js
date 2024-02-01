const express = require("express");
const router = new express.Router();
const SignUp = require("../models/SigninSchema");
const Save = require("../models/SaveSchema");
const Community = require("../models/CommunitySchema");
const Like = require("../models/LikeSchema");
const Post = require("../models/PostSchema");
const UserCard = require("../models/UserCardSchema");
const Comment = require("../models/commentsSchema");
const bios = require("../models/bioSchema");
const bcrypt = require("bcryptjs");
const Comarr = require("../models/ComArrSchema");
const authenticate = require("../middleware/authenticate");
const middleware = require("../middleware/middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadPr = multer({ storage: profileStorage });

const postsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.username; // Assuming you have the username in the request body
    const folderPath = path.join("uploads/posts", username);

    // Create the folder if it doesn't exist
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    // Generate a temporary unique filename
    const temporaryFilename = `${Date.now()}-${file.originalname}`;
    cb(null, temporaryFilename);
  },
});
const uploadpo = multer({ storage: postsStorage });

const communityStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.username; // Assuming you have the username in the request body
    const comName = req.body.comName;
    const folderPath = path.join(`uploads/community/${comName}`, username);

    // Create the folder if it doesn't exist
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    // Generate a temporary unique filename
    const temporaryFilename = `${Date.now()}-${file.originalname}`;
    cb(null, temporaryFilename);
  },
});
const uploadcom = multer({ storage: communityStorage });

router.post(
  "/api/signup",
  uploadPr.single("profilePhoto"),
  async (req, res) => {
    const { username, email, password, date } = req.body;
    const timestamp = date;

    const dateObject = new Date(timestamp);
    const day = dateObject.getUTCDate();
    const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
    const year = dateObject.getUTCFullYear();
    const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
      month: "long",
    });
    const time = dateObject.getTime();
    if (!username || !email || !password) {
      res.status(400).json("please fill the data");
    }
    try {
      console.log("start signup process");
      const preEmail = await SignUp.findOne({ email: email });
      const preUserName = await SignUp.findOne({ username: username });
      if (preEmail || preUserName) {
        res.status(403).json("this user is already present");
      } else {
        const newSignUp = new SignUp({
          username: username,
          email: email,
          password: password,
          profilePhoto: req.file.path,
          day: day,
          month: monthName,
          year: year,
          time: time,
        });

        const storeSignup = await newSignUp.save();

        const storeSave = await middleware.createSave(storeSignup.username);
        // console.log("saved Savecard:", storeSave);
        const storeCommunity = await middleware.createCommunity(
          storeSignup.username
        );
        // console.log("saved Communitycard");
        const storeUserCard = await middleware.createUsercard(
          storeSignup.username,
          storeSignup.profilePhoto,
          storeSignup.day,
          storeSignup.month,
          storeSignup.year,
          storeSignup.time
        );
        // console.log("saved usercard");

        res.status(201).json({
          status: 201,
          storeSignup,
          storeSave,
          storeCommunity,
          storeUserCard,
        });
      }
    } catch (err) {
      res.status(404).json(err);
      console.log("catched an error during signup");
    }
  }
);

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password) {
    res.status(400).json("please fill the data");
  }
  try {
    console.log("start login process");
    const userValid = await SignUp.findOne({ email: email });
    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);
      if (!isMatch) {
        console.log("something like password not matching");
        res.status(403).json({ error: "Password is incorrect" });
      } else {
        // console.log("coming here");
        const token = await userValid.generateAuthtoken();
        // console.log("token: ", token);
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 28800000), //token expires in 1 hour
          httpOnly: true,
        });

        const result = {
          userValid,
          token,
        };
        // console.log("result: ", result);
        res
          .status(201)
          .json({ status: 201, result, msg: "Successfully authenticated" });
      }
    } else {
      console.log("email not matching");
      res.status(401).json({ error: "email is not used till now.." });
    }
  } catch (err) {
    res.status(404).json(err);
    console.log("catched an error during login");
  }
});

router.get("/api/logout", authenticate, async (req, res) => {
  try {
    req.rootuser.tokens = req.rootuser[0].tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });
    res.clearCookie("usercookie", { path: "/" });
    req.rootuser[0].save();
    res.status(201).json({ status: 201, message: "good going" });
  } catch (error) {
    res.status(401).json({ status: 401, message: "not good going" });
  }
});

router.get("/api/validuser", authenticate, async (req, res) => {
  try {
    // console.log("testing for data: ", req.rootuser[0]);
    const validuserone = await SignUp.findOne({ _id: req.userid });
    res.status(201).json({ status: 201, validuserone });
  } catch (error) {
    res.status(401).json({ status: 401, validuserone });
  }
});

router.post("/api/addpost", uploadpo.single("post"), async (req, res) => {
  const { caption, location, username, date } = req.body;

  const timestamp = date;
  const dateObject = new Date(timestamp);
  const day = dateObject.getUTCDate();
  const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
  const year = dateObject.getUTCFullYear();
  const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  if (!username) {
    res.status(400).json("please fill the data");
  }
  try {
    console.log("start post adding process");
    const newPost = new Post({
      username: username,
      caption: caption,
      location: location,
      posturl: req.file.path,
      date: day,
      month: monthName,
      year: year,
      commentCount: 0,
    });

    if (newPost) {
      const postCount = await Post.countDocuments({ username });
      console.log("post count: ", postCount);
      await UserCard.findOneAndUpdate(
        { username },
        { $set: { posts: postCount + 1 } }
      );
    }
    const storePost = await newPost.save();

    // Update the filename to include _id now that it's available
    const finalFilename = `${storePost._id}.jpg`;
    const filePath = path.join(`uploads/posts/${username}`, finalFilename);

    fs.rename(req.file.path, filePath, async (err) => {
      if (err) {
        console.error("Error renaming file:", err);
      } else {
        // console.log("File renamed successfully:", finalFilename);
        await Post.updateOne(
          { _id: storePost._id },
          { $set: { posturl: filePath } }
        );
      }
    });

    const storeLike = await middleware.createLike(storePost._id);
    const storeComment = await middleware.createComment(storePost._id);

    res.status(201).json({
      status: 201,
      storePost,
      storeLike,
      storeComment,
      _id: storePost._id,
    });
  } catch (err) {
    res.status(404).json(err);
    console.log("catched an error while saving your post");
  }
});

router.post("/api/getposts", async (req, res) => {
  // console.log(req.body);
  const { username } = req.body;
  try {
    const result = await Post.find({ username: username });

    res.status(201).json({ status: 201, result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/deletepost", async (req, res) => {
  // console.log(req.body);
  const { id, username } = req.body;
  try {
    const deletedObject = await Post.findByIdAndDelete(id);
    const deletedObject1 = await Like.findOneAndDelete({ postId: id });
    const deletedObject2 = await Comment.findOneAndDelete({ postId: id });

    const result = await Save.updateMany(
      { postIDs: { $in: [id] } },
      { $pull: { postIDs: id } }
    );

    if (!deletedObject || !deletedObject1 || !deletedObject2) {
      return res.status(404).json({ error: "Object not found" });
    }

    const postCount = await Post.countDocuments({ username });
    await UserCard.findOneAndUpdate(
      { username },
      { $set: { posts: postCount } }
    );

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "posts",
      username,
      id + ".jpg"
    );
    // console.log("path: ", imagePath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      // console.log("deleted");
      return res.status(201).json({ message: "Object deleted successfully" });
    } else {
      return res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/deleteCompost", async (req, res) => {
  const { id, username, comName } = req.body;
  try {
    Comarr.updateOne(
      { "comPost._id": id },
      { $pull: { comPost: { _id: id } } },
      { new: true }
    )
      .then((result) => {
        if (result.nModified > 0) {
          console.log("No matching document found or object not removed.");
        } else {
          console.log("Object removed successfully");
        }
      })
      .catch((error) => {
        console.error("Error removing object:", error);
      });

    //COMMUNITY KE POSTS UPDATE KRNE / USSE PROFILE KE DETAILS BHARNI
    // const postCount = await Post.countDocuments({ username });
    // await UserCard.findOneAndUpdate(
    //   { username },
    //   { $set: { posts: postCount } }
    // );

    Comment.findOneAndDelete({ postId: id })
      .then((result) => {
        if (result.nModified > 0) {
          console.log("No matching document found or object not removed.");
        } else {
          console.log("Object1 removed successfully");
        }
      })
      .catch((error) => {
        console.error("Error removing object:", error);
      });

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "community",
      comName,
      username,
      id + ".jpg"
    );
    // console.log("path: ", imagePath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      // console.log("deleted");
      return res.status(201).json({ message: "Object deleted successfully" });
    } else {
      return res.status(201).json({ message: "Object deleted successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getprofiledetails", async (req, res) => {
  const username = req.query.username;
  // console.log("username: ", username);
  try {
    const result = await UserCard.find({ username: username });
    res.status(201).json({ status: 201, result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/setProfileBio", async (req, res) => {
  // console.log(req.body);
  const { username, bio, location, interests } = req.body;
  try {
    const newData = {
      username: username,
      bio: bio,
      location: location,
      interest: interests,
    };

    bios
      .findOneAndUpdate({ username: newData.username }, newData, {
        upsert: true,
        new: true,
      })
      .exec()
      .then((result) => {
        // console.log("Upsert successful:", result);
      })
      .catch((error) => {
        console.error("Error during upsert:", error);
      });

    const updatedUserCard = await UserCard.findOneAndUpdate(
      { username: newData.username },
      {
        $set: {
          bio: newData.bio,
          location: newData.location,
          interests: newData.interest,
        },
      }
    );
    console.log("updated: ", updatedUserCard);

    res.status(201).json({ status: 201 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/getProfileBio", async (req, res) => {
  // console.log(req.body);
  const { username } = req.body;
  try {
    let result = await bios.findOne({ username: username });
    // console.log("result: ", result);
    if (result == null) {
      result = {
        bio: "",
        location: "",
        interest: [],
      };
    }
    res.status(201).json({ status: 201, result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/sepratePost", async (req, res) => {
  const id = req.query.id;
  // console.log("Received id: ", id);
  try {
    const result = await Post.findOne({ _id: id });
    // console.error("E");
    if (result) {
      const like = await Like.find({ postId: id });
      // console.log("like: ", like);
      const likeCount = like[0].usernames.length;
      const comment = await Comment.find({ postId: id });
      const commentCount = comment[0].comments.length;
      const username = result.username;
      const result2 = await SignUp.findOne({ username: username });
      res
        .status(201)
        .json({ status: 201, result, result2, likeCount, commentCount });
    }
  } catch (error) {
    console.error("Error:");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/seprateComPost", async (req, res) => {
  const id = req.query.id;
  // console.log("id: ", id);
  try {
    const result = await Comarr.findOne(
      { "comPost._id": id },
      { "comPost.$": 1 }
    );
    if (result) {
      const username = result.comPost[0].username;
      const result2 = await SignUp.findOne({ username: username });
      res.status(201).json({ status: 201, result, result2 });
    }
  } catch (error) {
    console.error("Error:");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/addcomment", async (req, res) => {
  const { postid, username, comment, time } = req.body;
  // console.log("PI: ", postid);

  try {
    console.log("start comment adding process");

    const newData = {
      postId: postid,
      comments: {
        username: username,
        comment: comment,
        time: time,
      },
    };

    Comment.findOneAndUpdate(
      { postId: newData.postId },
      { $push: { comments: newData.comments } },
      {
        upsert: true,
        new: true,
      }
    )
      .exec()
      .then((result) => {
        // console.log("Upsert successful:", result);
      })
      .catch((error) => {
        console.error("Error during upsert:", error);
      });

    res.status(201).json({ status: 201 });
  } catch (err) {
    res.status(404).json(err);
    console.log("catched an error while saving your post");
  }
});

router.get("/api/getComments", async (req, res) => {
  const id = req.query.id;
  // console.log("Received id for comments: ", id);
  try {
    let result = await Comment.findOne({ postId: id });
    let flag = false;
    if (result == null) {
      result = {
        postId: id,
        comments: {
          username: "",
          comment: "",
          time: 0,
        },
      };
      flag = true;
    }
    let rest;
    if (flag == true) {
      rest = 0;
    } else {
      rest = result.comments.length;
    }
    Post.findOneAndUpdate(
      { _id: id },
      { $set: { commentCount: rest } },
      { new: true }
    )
      .then((updatedDocument) => {
        if (updatedDocument) {
          // console.log("Document updated");
        } else {
          // console.log("Document not found");
        }
      })
      .catch((error) => {
        console.error("Error updating document:", error);
      });
    res.status(201).json({ status: 201, result, rest });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getlikes", async (req, res) => {
  const id = req.query.id;

  try {
    const like = await Like.find({ postId: id });
    if (!like) {
      res.status(500).json({ error: "Internal Server Error" });
    }
    // console.log("l: ", like);
    const likeCount = like[0].usernames.length;
    res.status(201).json({ status: 201, likeCount });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/getLikeStatus", async (req, res) => {
  const { id, username } = req.body;
  // console.log("R: ");
  try {
    let ans = {
      isliked: false,
      isSaved: false,
      likecount: 0,
    };
    const like = await Like.findOne({ postId: id });
    let saves = await Save.findOne({ username: username });

    if (!like || !saves) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const isUsernamePresent = like.usernames.includes(username);
    const isPostSaved = saves.postIDs.includes(id);
    ans = {
      isliked: isUsernamePresent,
      likecount: like.usernames.length,
      isSaved: isPostSaved,
    };
    res.json({ result: ans });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/getComPostLikeStatus", async (req, res) => {
  const { id, username } = req.body;
  try {
    const document = await Comarr.findOne(
      { "comPost._id": id },
      { "comPost.$": 1 }
    );
    // console.log("doc: ", document);
    if (document.comPost[0].likes.includes(username)) {
      res.json({ status: 200, result: true });
    } else {
      res.json({ status: 200, result: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/api/updateLikeCount", async (req, res) => {
  const { liked, id, username } = req.body;

  try {
    const like = await Like.findOne({ postId: id });

    if (!like) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (liked) {
      if (!like.usernames.includes(username)) {
        like.usernames.push(username);
        await like.save();
      }
    } else {
      if (like && like.usernames.includes(username)) {
        like.usernames = like.usernames.filter((name) => name !== username);
        await like.save();
      }
    }
    const likeCount = like.usernames.length;
    res.json({ likeCount: likeCount });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/api/updateComLikeCount", async (req, res) => {
  const { liked, id, username } = req.body;

  try {
    const query = { "comPost._id": id };
    const projection = { "comPost.$": 1 };

    const like = await Comarr.findOne(query, projection);

    if (!like) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const updateQuery = { "comPost._id": id };
    const updateOperation = !like.comPost[0].likes.includes(username)
      ? { $push: { "comPost.$.likes": username } }
      : { $pull: { "comPost.$.likes": username } };

    await Comarr.findOneAndUpdate(query, updateOperation);
    res.json({ status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/api/setSaved", async (req, res) => {
  const { saved, id, username } = req.body;

  try {
    let saves = await Save.findOne({ username: username });

    if (saved) {
      if (!saves.postIDs.includes(id)) {
        saves.postIDs.push(id);
        await saves.save();
      }
    } else {
      if (saves && saves.postIDs.includes(id)) {
        saves.postIDs = saves.postIDs.filter((name) => name !== id);
        await saves.save();
      }
    }

    res.json({ status: 201 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getSavedPosts", async (req, res) => {
  const username = req.query.username;
  try {
    const result = await Save.findOne({ username: username });
    if (result) {
      res.status(201).json({ status: 201, result });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getMyCommunities", async (req, res) => {
  const username = req.query.username;
  try {
    const result = await Community.findOne({ username: username });
    if (result) {
      res.status(201).json({ status: 201, result });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getPeopleToFollow", async (req, res) => {
  const username = req.query.username;
  try {
    const usernames = await SignUp.distinct("username", {
      username: { $ne: username },
    });

    // console.log("Usernames:", usernames);
    res.status(201).json({ status: 201, usernames });
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
});

router.get("/api/getPeopleFollowing", async (req, res) => {
  const username = req.query.username;
  try {
    const followingArray = await UserCard.find({ username: username });
    // console.log("sadds", followingArray[0].following);
    const arrayOfNames = followingArray[0].following.map((obj) => obj.name);
    res.status(201).json({ status: 201, peopleFollow: arrayOfNames });
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
});

router.post("/api/updateCommunities", async (req, res) => {
  const { username, name } = req.body;

  try {
    const user = await Community.findOne({ username });

    if (!user) {
      const newUser = new Community({
        username,
        communities: [name],
      });

      await newUser.save();
      await UserCard.findOneAndUpdate({ username }, { communities: 1 });
      res.json({ result: true });
    } else {
      const communityIndex = user.communities.indexOf(name);
      if (communityIndex === -1) {
        user.communities.push(name);
        await user.save();
        await UserCard.findOneAndUpdate(
          { username },
          { communities: user.communities.length }
        );

        //YHA COM + 1 KRNA HAI
        const result2 = await Comarr.findOneAndUpdate(
          { comName: name },
          { $inc: { members: 1 } },
          { new: true }
        );

        // console.log("inc: ", result2.value);
        res.json({ result: true });
      } else {
        user.communities.splice(communityIndex, 1);
        await user.save();
        await UserCard.findOneAndUpdate(
          { username },
          { communities: user.communities.length }
        );

        //YHA COM - 1 KRNA HAI
        const result2 = await Comarr.findOneAndUpdate(
          { comName: name },
          { $inc: { members: -1 } },
          { new: true }
        );

        // console.log("dec: ", result2.value);
        res.json({ result: false });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/Updatecomjoin", async (req, res) => {
  const { username, name } = req.body;

  try {
    const user = await Community.findOne({ username });
    const communityIndex = user.communities.indexOf(name);

    if (communityIndex === -1) {
      res.json({ result: true });
    } else {
      res.json({ result: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/getuser", async (req, res) => {
  const username = req.query.username;
  try {
    const user = await UserCard.find({ username: username });
    res.status(201).json({ status: 201, user });
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
});

router.post("/api/updateFollow", async (req, res) => {
  const { username, name, date } = req.body;

  const dateObject = new Date(date);
  const day = dateObject.getUTCDate();
  const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
  const year = dateObject.getUTCFullYear();
  const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  try {
    const result = await UserCard.updateOne(
      { username: username },
      {
        $push: {
          following: {
            name: name,
            date: day,
            month: monthName,
            year: year,
          },
        },
      }
    );
    const result1 = await UserCard.updateOne(
      { username: name },
      { $push: { followers: username } }
    );
    res.status(201).json({ status: 201, result, result1 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/updateFollower", async (req, res) => {
  const { username, name } = req.body;
  console.log(username, " :   ", name);

  try {
    const result = await UserCard.updateOne(
      { username: username },
      { $pull: { followers: name } }
    );
    const result1 = await UserCard.updateOne(
      { username: name },
      { $pull: { following: { name: username } } }
    );
    res.status(201).json({ status: 201, result, result1 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/updateFollowing", async (req, res) => {
  const { username, name } = req.body;
  console.log(username, " :   ", name);

  try {
    const result = await UserCard.updateOne(
      { username: username },
      { $pull: { following: { name: name } } }
    );
    const result1 = await UserCard.updateOne(
      { username: name },
      { $pull: { followers: username } }
    );
    res.status(201).json({ status: 201, result, result1 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/CheckFollow", async (req, res) => {
  const { username, name } = req.body;

  try {
    const user = await UserCard.findOne({ username });
    if (user) {
      const isFollower = user.following.some((item) => item.name === name);
      res.status(201).json({ status: 201, result: isFollower });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/updateFollowingOrNot", async (req, res) => {
  const { username, name, isFollowed, date } = req.body;
  try {
    const user = await UserCard.findOne({ username });
    if (user) {
      if (isFollowed) {
        // Remove the name from the following array
        await UserCard.findOneAndUpdate(
          { username },
          { $pull: { following: { name: name } } }
        );
      } else {
        // Add the name to the following array
        const dateObject = new Date(date);
        const day = dateObject.getUTCDate();
        const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
        const year = dateObject.getUTCFullYear();
        const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
          month: "long",
        });
        await UserCard.findOneAndUpdate(
          { username },
          {
            $addToSet: {
              following: {
                name: name,
                date: day,
                month: monthName,
                year: year,
              },
            },
          }
        );
        console.log("username2");
      }
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }

    const user2 = await UserCard.findOne({ username: name });
    if (user2) {
      if (isFollowed) {
        // Remove the name from the following array
        await UserCard.findOneAndUpdate(
          { username: name },
          { $pull: { followers: username } }
        );
      } else {
        // Add the name to the following array
        await UserCard.findOneAndUpdate(
          { username: name },
          { $addToSet: { followers: username } }
        );
      }
      console.log("ab aaya ");
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating following:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/api/getmembers", async (req, res) => {
  try {
    const result = await Comarr.find({});
    res.status(201).json({ status: 201, result });
  } catch (error) {
    console.error("Error fetching usernames:", error);
  }
});

router.get("/api/getItemForsearch", async (req, res) => {
  try {
    const resultspec = await Comarr.find({});
    const result1 = resultspec.map((obj) => obj["_doc"]);
    const result2 = result1.map((obj) => ({ ...obj, type: "community" }));
    const resultSpecify = await SignUp.find({});
    const keysToInclude = ["username", "email", "profilePhoto"];
    const result3 = resultSpecify.map((obj) => {
      const newObj = {};
      keysToInclude.forEach((key) => {
        newObj[key] = obj[key];
      });
      return newObj;
    });
    const result4 = result3.map((obj) => ({ ...obj, type: "user" }));
    const result = result2.concat(result4);

    res.status(201).json({ status: 201, result });
  } catch (error) {
    console.error("Error fetching usernames:", error);
  }
});

router.post("/api/addCommunityPostWithoutImage", async (req, res) => {
  const { comName, textpost, username, date } = req.body;

  const timestamp = date;
  const dateObject = new Date(timestamp);
  const day = dateObject.getUTCDate();
  const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
  const year = dateObject.getUTCFullYear();
  const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  if (!username || !comName || !textpost) {
    res.status(400).json("please fill the data");
  }
  try {
    console.log("start community post adding process");
    const newPost = {
      username: username,
      date: day,
      month: monthName,
      year: year,
      text: textpost,
      comName: comName,
    };

    const updatedDocument = await Comarr.findOneAndUpdate(
      { comName: comName },
      { $push: { comPost: newPost } },
      { new: true } // Set the 'new' option to true to return the updated document
    );

    const result = updatedDocument.comPost[updatedDocument.comPost.length - 1];
    const storeComment = await middleware.createComment(result._id);

    res.status(200).json({ message: "Post added successfully" });
  } catch (err) {
    res.status(404).json(err);
    console.log("catched an error while adding your community post");
  }
});

router.post(
  "/api/addCommunityPostWithImage",
  uploadcom.single("community"),
  async (req, res) => {
    // console.log(req.body);
    const { comName, textpost, username, date } = req.body;
    // console.log("files: ", req.file);

    const timestamp = date;
    const dateObject = new Date(timestamp);
    const day = dateObject.getUTCDate();
    const month = dateObject.getUTCMonth() + 1; // Months are zero-indexed, so add 1
    const year = dateObject.getUTCFullYear();
    const monthName = new Date(2000, month - 1, 1).toLocaleString("en-US", {
      month: "long",
    });

    if (!username || !comName) {
      res.status(400).json("please fill the data");
    }
    try {
      console.log("start community post adding process");

      const newPost = {
        username: username,
        date: day,
        month: monthName,
        year: year,
        text: textpost,
        url: req.file.path,
        comName: comName,
      };

      const updatedDocument = await Comarr.findOneAndUpdate(
        { comName: comName },
        { $push: { comPost: newPost } },
        { new: true } // Set the 'new' option to true to return the updated document
      );

      const result =
        updatedDocument.comPost[updatedDocument.comPost.length - 1];
      // console.log("Newly added object:", result);

      const storeComment = await middleware.createComment(result._id);

      const finalFilename = `${result._id}.jpg`;
      const filePath = path.join(
        `uploads/community/${comName}/${username}`,
        finalFilename
      );

      fs.rename(req.file.path, filePath, async (err) => {
        if (err) {
          console.error("Error renaming file:", err);
        } else {
          const aa = await Comarr.findOneAndUpdate(
            { "comPost._id": result._id },
            { $set: { "comPost.$.url": filePath } },
            { new: true }
          );
        }
      });

      res.status(201).json({
        status: 201,
        _id: result._id,
      });
    } catch (err) {
      res.status(404).json(err);
      console.log("catched an error while saving your post");
    }
  }
);

router.get("/api/getComPost", async (req, res) => {
  const comName = req.query.comName;
  try {
    const result = await Comarr.findOne({ comName });
    res.status(201).json({ status: 201, result: result.comPost });
  } catch (error) {
    console.error("Error fetching usernames:", error);
  }
});

router.get("/api/getHomePosts", async (req, res) => {
  const username = req.query.username;
  try {
    const usercard = await UserCard.findOne({ username });
    // console.log("usercarddd: ", usercard.following);

    const followingArray = usercard.following.map(
      (following) => following.name
    );

    // console.log("followingArray: ", followingArray);
    const posts = await Post.find({ username: { $in: followingArray } });
    // console.log("postssss: ", posts);

    const comcard = await Community.findOne({ username });
    // console.log("communities: ", comcard.communities);

    const communityArray = comcard.communities;
    // console.log("communityArray: ", communityArray);
    const composts = await Comarr.find({ comName: { $in: communityArray } });
    const comPosts = composts.flatMap((compost) => compost.comPost);
    // console.log("postssss: ", comPosts);

    res.status(201).json({ status: 201, posts: posts, comPosts: comPosts });
  } catch (error) {
    console.error("Error fetching usernames:", error);
  }
});

module.exports = router;

// const cloudinary = require("cloudinary").v2;

// try {
//   const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//     public_id: username, // Set the custom public ID
//     folder: "profile", // Specify the folder in Cloudinary
//     use_filename: true, // Use the original filename as part of the public ID
//   });
// } catch (error) {
//   console.error("Error uploading to Cloudinary:", error);
//   throw error;
// }

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });
