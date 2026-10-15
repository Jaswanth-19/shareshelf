
const mongoose = require("mongoose");
const Item = require("../models/Item");

// Create a new item listing
const createItem = async (req, res) => {
  try {
    const { title, description, category, condition, imageUrl } = req.body;

    if (!title || !description || !category || !condition) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and condition are required.",
      });
    }

    const item = await Item.create({
      owner: req.user.userId,
      title,
      description,
      category,
      condition,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Item listed successfully.",
      item,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create item.",
    });
  }
};

// Get all available items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ availability: "Available" })
      .populate("owner", "name communityType communityName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve items.",
    });
  }
};

// Get one item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item = await Item.findById(id).populate(
      "owner",
      "name communityType communityName"
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve item.",
    });
  }
};

// Update an item owned by the logged-in user
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    if (item.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own items.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "condition",
      "availability",
      "imageUrl",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item updated successfully.",
      item,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update item.",
    });
  }
};

// Delete an item owned by the logged-in user
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    if (item.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own items.",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete item.",
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
