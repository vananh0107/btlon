const mongoose = require('mongoose');
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      require: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        title: String,
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Color',
        },
      },
    ],
    color: [],
    availablity: {
      type: String,
      default: 'In Stock',
    },
    rating: [
      {
        star: Number,
        comment: String,
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        date: Date,
        name: String,
      },
      {
        timestamps: true,
      },
    ],
    totalrating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model('Product', productSchema);