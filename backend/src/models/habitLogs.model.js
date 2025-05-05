import mongoose, { Schema } from "mongoose";

const habitLogSchema = new Schema(
  {
    habit: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["completed", "missed", "pending"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const HabitLog = mongoose.model("HabitLog", habitLogSchema);
