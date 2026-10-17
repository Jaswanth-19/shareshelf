
const express = require("express");

const {
    createBorrowRequest,
    getMyBorrowRequests,
    decideBorrowRequest,
  } = require("../controllers/borrowRequestController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a borrowing request (login required)
router.post("/", protect, createBorrowRequest);

// View requests submitted by the logged-in borrower
router.get("/my-requests", protect, getMyBorrowRequests);

router.patch("/:id/:action", protect, decideBorrowRequest);

module.exports = router;
