const mongoose = require('mongoose');

const User = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  email:
  {
    type:String,
  },
  picture:
  {
    type:String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('User', User);
