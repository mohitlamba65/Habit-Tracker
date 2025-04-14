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
            type: Boolean,
            default: false
        },
        completion_time: {
            type: String,
            required: [true, "Completion time is required"]
        }
    },
    { timestamps: true }
);

export const Habit = mongoose.model("Habit", habitSchema);
