const mongoose = require('mongoose');

const quizgenSchema = new mongoose.Schema({
  questiontext: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: "There must be exactly 4 options"
    },
    required: true
  },
  correctOptionIndex: {
    type: Number,
    required: true
  }
});

const quizSchema = new mongoose.Schema({
  Topic: {
    type: String,
    required: true
  },
  countof: {
    type: Number,
  },
  question: [quizgenSchema],
  source: {
    type: String,
    default: "Ai"
  }
});

const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = Quiz;
