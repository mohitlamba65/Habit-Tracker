import { Habit } from "../models/habit.model.js";
import { User } from "../models/user.model.js";

export const createHabit = async (req, res) => {
    try {
        const { habit, completion_time } = req.body;

        if (!habit || !completion_time) {
            return res.status(400).json({ message: "Habit and completion time are required." });
        }

        const newHabit = await Habit.create({
            owner: req.user._id,
            habit,
            completion_time,
        });

        await User.findByIdAndUpdate(req.user._id, {
            $push: { habits: newHabit._id }
        });

        res.status(201).json(newHabit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const markHabitComplete = async (req, res) => {
    try {
        const { habitId } = req.params;

        const updatedHabit = await Habit.findOneAndUpdate(
            { _id: habitId, owner: req.user._id },
            { status: true },
            { new: true }
        );

        if (!updatedHabit) {
            return res.status(404).json({ message: "Habit not found or unauthorized" });
        }

        res.json(updatedHabit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteHabit = async (req, res) => {
    try {
        const { habitId } = req.params;

        const habit = await Habit.findOneAndDelete({
            _id: habitId,
            owner: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: "Habit not found or unauthorized" });
        }

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { habits: habitId }
        });

        res.json({ message: "Habit deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getUserHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
