
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Item owner is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      minlength: [10, "Description must contain at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Item category is required"],
      enum: [
        "Books",
        "Electronics",
        "Sports",
        "Tools",
        "Home",
        "Accessories",
        "Other",
      ],
    },

    condition: {
      type: String,
      required: [true, "Item condition is required"],
      enum: ["New", "Like New", "Good", "Fair"],
    },

    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Image URL cannot exceed 2048 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
