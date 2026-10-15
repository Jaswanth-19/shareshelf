
const express = require("express");

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// View all available items
router.get("/", getItems);

// View one item
router.get("/:id", getItemById);

// Create a listing (login required)
router.post("/", protect, createItem);

// Update a listing (login required)
router.put("/:id", protect, updateItem);

// Delete a listing (login required)
router.delete("/:id", protect, deleteItem);

module.exports = router;
