const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/worldWise");

const positionSchema = new mongoose.Schema({ lat: Number, lng: Number });

const citySchema = new mongoose.Schema({
  cityName: String,
  country: String,
  emoji: String,
  date: String,
  notes: String,
  position: positionSchema,
});

const userSchema = new mongoose.Schema({
  fullName: String,
  userName: String,
  email: String,
  password: String,
  position: positionSchema,
  city: [citySchema],
  avatar: String,
});

const user = mongoose.model("user", userSchema);

// const city = mongoose.model("city", citySchema);

app.get("/users", (req, res) => {
  user.find({}).then((user) => res.send(user));
});

app.post("/users", (req, res) => {
  const newUser = new user(req.body);

  user.find({}).then((users) => {
    const isSigned = users.some((user) => user.email === newUser.email);
    if (!isSigned) {
      newUser
        .save()
        .then((userSave) => console.log("New user data saved successfully"))
        .catch((err) => console.log("Error in saving newUser data...", err));
    }
  });
});

app.get("/cities", (req, res) => {
  user.find({}, { city: 1, email: 1 }).then((user) => res.send(user));
});

app.post("/cities/:currentUserEmail/:request", (req, res) => {
  //TODO ######## currentUserEmail and request is the parameters passed

  const { currentUserEmail, request } = req.params;

  //TODO ####### For adding a new city to the city list.

  if (request === "createCity") {
    const { newCity } = req.body;

    user
      .findOneAndUpdate(
        { email: currentUserEmail }, //! Query to find the user with email=== currentUserEmail
        { $push: { city: newCity } }, //! Use $push to add newCity to the city array
        { new: true } // Set 'new' option to true to return the updated document
      )
      .then((updatedUser) => {
        if (updatedUser) {
          console.log("City added successfully");
        } else {
          console.log("User not found.");
        }
      })
      .catch((error) => {
        console.error("Error adding city:", error);
      });
  }

  //TODO ########## For deleting a city from the city list.

  if (request === "deleteCity") {
    const { id } = req.body;

    user
      .findOneAndUpdate(
        { email: currentUserEmail }, //! Query to find the user with email=== currentUserEmail
        { $pull: { city: { _id: id } } }, //! Use to pull the a city from the city array having _id === id
        { new: true } // Set 'new' option to true to return the updated document
      )
      .then((updatedUser) => {
        if (updatedUser) {
          console.log("City deleted successfully");
        } else {
          console.log("User not found.");
        }
      })
      .catch((error) => {
        console.error("Error adding city:", error);
      });
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
