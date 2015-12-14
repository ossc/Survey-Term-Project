var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var schema = new Schema({
  email: {type: String, required: true, trim: true},
  title: {type: String, required: true, trim: true},
  numComment: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  question: {type: String, trim: true},
  example1: {type: String, trim: true},
  example2: {type: String, trim: true},
  example3: {type: String, trim: true},
  example4: {type: String, trim: true},
}, {
  toJSON: {virtuals: true },
  toObject: {virtuals: true}
});

var Post = mongoose.model('Post', schema);

module.exports = Post;
