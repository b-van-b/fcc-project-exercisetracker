const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();

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

app.use(cors());
app.use(express.static("public"));
app.use("/api/users", bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
  User.find()
    .select({ _id: 1, username: 1 })
    .exec((err, data) => {
      if (err) return console.log(err);
      res.json(data);
    });
});

app.post("/api/users", (req, res) => {
  const name = req.body.username.trim();
  if (!name) {
    return console.log("Empty string submitted as username");
  }
  console.log(
    "\nNew user submitted: " + name + "\n- Inserting new document..."
  );
  user = new User({ username: req.body.username });
  user.save((err, data) => {
    if (err) return console.log(err);
    console.log("- Success:\n" + data);
    res.json({ username: data.username, _id: user._id });
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  console.log("\nNew exercise data submitted...");
  console.log("- user id: " + req.params._id);
  const exercise = {
    description: req.body.description,
    duration: Number(req.body.duration),
    date: req.body.date,
  };
  console.log(exercise);
  User.findByIdAndUpdate(
    req.params._id,
    { $push: { exercises: exercise } },
    { new: true },
    (err, data) => {
      if (err) return console.log(err);
      if (!data) return console.log("- No such user!");
      // return expected output
      const lastExercise = data.exercises[data.exercises.length - 1];
      const ans = {
        _id: req.params._id,
        username: data.username,
        duration: lastExercise.duration,
        description: lastExercise.description,
        date: lastExercise.date.toDateString(),
      };
      res.json(ans);
    }
  );
});

app.get("/api/users/:_id/logs", (req, res) => {
  console.log("\nAsked for exercise records: id=" + req.params._id);
  console.log(req.query);
  let start = req.query.from,
    end = req.query.to,
    limit = req.query.limit;
  User.findById(req.params._id, (err, data) => {
    if (err) return console.log(err);
    if (data) {
      // gather relevant info into an object
      const ans = {
        _id: req.params._id,
        username: data.username,
        count: 0,
        log: [],
      };
      // filter log
      let log = data.exercises.slice();
      // remove too-early entries
      if (start) {
        start = new Date(start);
        log = log.filter((item) => {
          return item.date >= start;
        });
      }
      // remove too-late entries
      if (end) {
        end = new Date(end);
        log = log.filter((item) => {
          return item.date <= end;
        });
      }
      // sort
      log.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
        return 0;
      });
      // limit length
      if (limit) {
        log = log.slice(0, limit);
      }
      // map data to expected output
      log = log.map((item) => {
        return {
          description: item.description,
          duration: item.duration,
          date: item.date.toDateString(),
        };
      });
      // add log & count to answer
      ans.log = log;
      ans.count = log.length;

      return res.json(ans);
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
