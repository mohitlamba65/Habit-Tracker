import mongoose, { Schema } from "mongoose";

const habitSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    habit: {
      type: String,
      required: [true, "Habit name is required"],
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ["completed","pending","missed"],
      default: "pending"
    },
    completion_time: {
      type: String,
      required: [true, "Completion time is required"]
    },
    actual_due: {
      type: Date,
      default: null
    },    
    reminderTime: {
      type: String,
      default: "20:00"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  { timestamps: true }
);

export const Habit = mongoose.model("Habit", habitSchema);