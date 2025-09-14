const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a course title."],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please add a course description."],
    },
    weeks: {
      type: Number,
      required: [true, "Please add number of weeks."],
    },
    tuition: {
      type: Number,
      required: [true, "Please add a tuition cost."],
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add a minimum skill."],
      enum: ["beginner", "intermediate", "advanced"],
    },
    scholarhipsAvailable: {
      type: Boolean,
      default: false,
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

CourseSchema.statics.getAverageCost = async function (bootcampId, mode) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  console.log(obj.length);

  try {
    let avgCost;

    if (obj.length > 0) {
      // Round up to nearest 10
      avgCost = Math.ceil(obj[0].averageCost / 10) * 10;

      // Check if we’re deleting the last course
      const countDocs = await this.model("Course").countDocuments({
        bootcamp: bootcampId,
      });
      if (countDocs === 0 && mode === "del") {
        avgCost = undefined; // or null
      }
    } else {
      // No courses left for this bootcamp
      avgCost = undefined; // or null
    }

    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: avgCost,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp, "add");
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp, "del");
});

module.exports = mongoose.model("Course", CourseSchema);
