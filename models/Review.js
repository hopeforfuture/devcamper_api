const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a title for the review."],
      maxlength: 100,
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Please add some text."],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Please add a rating between 1 and 10."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (bootcampId, mode) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    let avgRating;

    if (obj.length > 0) {
      // Round up to nearest 10
      avgRating = obj[0].averageRating;

      // Check if we’re deleting the last review
      const countDocs = await this.model("Review").countDocuments({
        bootcamp: bootcampId,
      });
      if (countDocs === 0 && mode === "del") {
        avgRating = undefined; // or null
      }
    } else {
      // No review left for this bootcamp
      avgRating = undefined; // or null
    }

    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: avgRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp, "add");
});

// Call getAverageRating before remove
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp, "del");
});

module.exports = mongoose.model("Review", ReviewSchema);
