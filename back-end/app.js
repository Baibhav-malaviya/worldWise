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

const city = mongoose.model("city", citySchema);

const newUser = new user({
  fullName: "Ram",
  userName: "call_me_ram",
  email: "ram@gmail.com",
  password: "kalyug@top",
  position: { lat: 22, lng: 45 },
  city: [
    {
      cityName: "Madrid",
      country: "Spain",
      emoji: "🇪🇸",
      date: "2027-07-15T08:22:53.976Z",
      notes: "",
      position: {
        lat: 40.46635901755316,
        lng: -3.7133789062500004,
      },
    },
  ],
  avatar: "http://www.generate-apatar.com/images/icon/ramG",
});

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
  //For adding the new city
  const { currentUserEmail, request } = req.params;

  if (request === "createCity") {
    const { newCity } = req.body;
    user
      .findOneAndUpdate(
        { email: currentUserEmail }, // Query to find the user by ObjectId
        { $push: { city: newCity } }, // Use $push to add newCity to the city array
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
  if (request === "deleteCity") {
    const { id } = req.body;
    user
      .findOneAndUpdate(
        { email: currentUserEmail }, // Query to find the user by ObjectId
        { $pull: { city: { _id: id } } }, // Use $push to add newCity to the city array
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
