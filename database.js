require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// user schema and model
const userSchema = new mongoose.Schema({
  username: String,
});
const User = mongoose.model("User", userSchema);

// exercise schema and model
const exerciseSchema = new mongoose.Schema({
  user_id: String,
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

const createUser = (username, done) => {
  if (!username) {
    return { error: "empty username submitted; no user created" };
  }
  console.log(`\nNew user submitted: ${username}\n- Inserting new document...`);
  user = new User({ username: username });
  user.save((err, data) => {
    if (err) return console.log(err);
    console.log("- Success:\n" + data);
    done(null, data);
  });
};

const findUser = (userId, done) => {
  User.findById(userId, (err, data) => {
    if (err) return console.log(err);
    done(null, data);
  });
};

const findAllUsers = (done) => {
  User.find()
    .select({ _id: 1, username: 1 })
    .exec((err, data) => {
      if (err) return console.log(err);
      done(null, data);
    });
};

const createExercise = (userId, description, duration, date, done) => {
  // create an exercise doc and return the exercise with user id and username
  const exercise = new Exercise({
    user_id: userId,
    description: description,
    duration: Number(duration),
    date: date,
  });
  console.log("Inserting new exercise: \n" + exercise);
  // make sure the user exists, and get the username
  User.findById(userId, (err, user) => {
    if (err) return console.log(err);
    if (!user) return done("user not found");
    // if user exists, add the exercise
    exercise.save((err, savedata) => {
      if (err) return console.log(err);
      // return exercise with additional user info
      done(null, {
        _id: userId,
        username: user.username,
        description: savedata.description,
        duration: savedata.duration,
        date: savedata.date,
      });
    });
  });
};

const getExerciseLogs = (userId, searchParams, done) => {
  // find user first
  User.findById(userId)
    .lean()
    .exec((err, user) => {
      if (err) return console.log(err);
      if (!user) return done("user not found");
      // build query filter
      const filter = { user_id: userId };
      if (searchParams.from || searchParams.to) {
        filter.date = {};
        if (searchParams.from) {
          filter.date.$gte = new Date(searchParams.from);
        }
        if (searchParams.to) {
          filter.date.$lte = new Date(searchParams.to);
        }
      }
      // search with filter & sort
      const logQuery = Exercise.find(filter)
        .select({ _id: 0, user_id: 0, __v: 0 })
        .sort({ date: 1 })
        .lean();
      // limit if requested
      if (searchParams.limit) {
        logQuery.limit(Number(searchParams.limit));
      }
      // handle data
      logQuery.exec((err, data) => {
        if (err) return console.log(err);
        user.count = data.length;
        user.log = data;
        done(null, user);
      });
    });
};

exports.createUser = createUser;
exports.findAllUsers = findAllUsers;
exports.findUser = findUser;
exports.createExercise = createExercise;
exports.getExerciseLogs = getExerciseLogs;
