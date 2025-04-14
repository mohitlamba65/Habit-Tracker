import mongoose, { Schema } from "mongoose";

const predictionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        peak_productivity_times: {
            type: [String]
        }
    },
    { timestamps: true }
)

export const Prediction = mongoose.model("Prediction", predictionSchema)