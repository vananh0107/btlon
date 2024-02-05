const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    images: {
      title: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PCategory', categorySchema);
