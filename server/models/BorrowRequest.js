
const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item is required"],
      index: true,
    },

    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Borrower is required"],
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Item owner is required"],
      index: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "active",
        "returned",
      ],
      default: "pending",
      index: true,
    },

    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Reject invalid date ranges at the database-model level.
borrowRequestSchema.pre("validate", function () {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate <= this.startDate
  ) {
    this.invalidate("endDate", "End date must be after the start date.");
  }
});

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
