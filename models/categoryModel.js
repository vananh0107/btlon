const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
  url: String,
  publicId: String,
});
var categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    image: {
      type: imageSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PCategory', categorySchema);
