const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const database = require("./database");
require("dotenv").config();

const formatDates = (obj) => {
  // format dates in an object and its nested arrays of objects
  const res = {};
  // iterate through all key-value pairs and make copies
  // console.log("Formatting dates...");
  // console.log("Object: \n"+obj);
  // console.log("Keys: \n"+Object.keys(obj));
  Object.keys(obj).forEach((key) => {
    // recurse through an array of objects when found
    if (Array.isArray(obj[key])) {
      res[key] = obj[key].map((item) => {
        return formatDates(item);
      });
    } else if (obj[key] instanceof Date) {
      // format nice date strings for Date objects
      // console.log("Found a date: "+obj[key])
      res[key] = obj[key].toDateString();
    } else {
      // copy all other data types
      res[key] = obj[key];
    }
  });
  // console.log("Final result:\n"+res);
  return res;
};

app.use(cors());
app.use(express.static("public"));
app.use("/api/users", bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const name = req.body.username.trim();
  database.createUser(name, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

app.get("/api/users", (req, res) => {
  database.findAllUsers((err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  console.log("\nNew exercise data submitted...");
  console.log("- user id: " + req.params._id);

  database.createExercise(
    req.params._id,
    req.body.description,
    req.body.duration,
    req.body.date,
    (err, data) => {
      if (err) return console.log(err);
      res.json(formatDates(data));
    }
  );
});

app.get("/api/users/:_id/logs", (req, res) => {
  console.log("\nAsked for exercise records: id=" + req.params._id);
  console.log(req.query);
  database.getExerciseLogs(req.params._id, req.query, (err, data) => {
    if (err) return console.log(err);
    res.json(formatDates(data));
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
