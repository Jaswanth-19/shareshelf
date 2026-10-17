
const mongoose = require("mongoose");
const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Item");

// Create a borrowing request
const createBorrowRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate } = req.body;

    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Item ID, start date, and end date are required.",
      });
    }

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid dates; the end date must be after the start date.",
      });
    }

    if (start <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "The start date must be in the future.",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    if (item.availability !== "Available") {
      return res.status(400).json({
        success: false,
        message: "This item is currently unavailable.",
      });
    }

    if (item.owner.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot request to borrow your own item.",
      });
    }

    // Prevent requests that overlap an existing approved or active booking.
    const conflictingBooking = await BorrowRequest.findOne({
      item: item._id,
      status: { $in: ["approved", "active"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "This item already has an overlapping approved booking.",
      });
    }

    const borrowRequest = await BorrowRequest.create({
      item: item._id,
      borrower: req.user.userId,
      owner: item.owner,
      startDate: start,
      endDate: end,
    });

    return res.status(201).json({
      success: true,
      message: "Borrow request submitted successfully.",
      borrowRequest,
    });
  } catch (error) {
    console.error("Create borrow request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create borrow request.",
    });
  }
};

// Get requests submitted by the logged-in user
const getMyBorrowRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({
      borrower: req.user.userId,
    })
      .populate("item", "title category condition imageUrl")
      .populate("owner", "name communityType communityName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my borrow requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your borrow requests.",
    });
  }
};

// Approve or reject a pending borrowing request
const decideBorrowRequest = async (req, res) => {
    try {
      const { action } = req.params;
  
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action must be approve or reject.",
        });
      }
  
      const borrowRequest = await BorrowRequest.findById(req.params.id);
  
      if (!borrowRequest) {
        return res.status(404).json({
          success: false,
          message: "Borrow request not found.",
        });
      }
  
      // Only the item's owner can decide the request.
      if (borrowRequest.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the item owner can approve or reject this request.",
        });
      }
  
      if (borrowRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be approved or rejected.",
        });
      }
  
      if (action === "approve") {
        // Recheck for conflicts when approving, not just when requesting.
        const conflictingBooking = await BorrowRequest.findOne({
          _id: { $ne: borrowRequest._id },
          item: borrowRequest.item,
          status: { $in: ["approved", "active"] },
          startDate: { $lt: borrowRequest.endDate },
          endDate: { $gt: borrowRequest.startDate },
        });
  
        if (conflictingBooking) {
          return res.status(409).json({
            success: false,
            message: "This request overlaps another approved booking.",
          });
        }
  
        borrowRequest.status = "approved";
      } else {
        borrowRequest.status = "rejected";
      }
  
      await borrowRequest.save();
  
      return res.status(200).json({
        success: true,
        message: `Borrow request ${action === "approve" ? "approved" : "rejected"} successfully.`,
        borrowRequest,
      });
    } catch (error) {
      console.error("Decide borrow request error:", error.message);
  
      return res.status(500).json({
        success: false,
        message: "Unable to process the borrowing decision.",
      });
    }
  };

module.exports = {
  createBorrowRequest,
  getMyBorrowRequests,
  decideBorrowRequest,
};
