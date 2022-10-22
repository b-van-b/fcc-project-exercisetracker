require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  exercises: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});
const User = mongoose.model("User", userSchema);

exports.User = User;
