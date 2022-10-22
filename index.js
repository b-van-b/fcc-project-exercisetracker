const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const database = require("./database");
require("dotenv").config();

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
      res.json(data);
    }
  );
});

app.get("/api/users/:_id/logs", (req, res) => {
  console.log("\nAsked for exercise records: id=" + req.params._id);
  console.log(req.query);
  database.getExerciseLogs(req.params._id, req.query, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
