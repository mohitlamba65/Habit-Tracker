import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {v2 as cloudinary} from "cloudinary"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        return res
            .status(500)
            .json({
                message: "Something went wrong while generating referesh and access token"
            })
    }
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password,phone} = req.body

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json(
                {
                    message: "User already exists"
                }
            )
        }

        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path
        }

        console.log(req.files);

        const avatar = await uploadOnCloudinary(avatarLocalPath)


        const newUser = await User.create({
            name,
            phone,
            email,
            password,
            avatar: avatar?.url || "",
        })

        const createdUser = await User.findById(newUser._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        res.status(201).json({
            message: "User registered successfully",
            createdUser
        })
    }
    catch (error) {
        res.status(500).json(
            {
                message: error.message
            }
        )
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).populate("habits")

        if (!user) {
            return res.status(404).json(
                {
                    message: "User does not exists"
                }
            )
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "Login successful",
                user: loggedInUser, accessToken, refreshToken
            })
    } catch (error) {
        res.status(500).json(
            {
                message: error.message
            }
        )
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        return res
            .status(200)
            .json({
                user: req.user,
                message: "Current User fetched successfully",
            })
    } catch (error) {
        return res
            .status(500)
            .json({
                message: error?.message || "Something went wrong"
            })
    }
}

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                message: "User logged out",
            })
    } catch (error) {
        res.status(500).json(
            {
                message: error.message
            }
        )
    }
}

export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json({
                message: "Unauthorized request"
            })
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            return res
                .status(401)
                .json({
                    message: "Invalid refresh token"
                })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(401)
                .json({
                    message: "Refresh Token is expired or used"
                })

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                accessToken,
                newRefreshToken,
                message: "Access token refreshed"
            })

    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong",
        });
    }

}

export const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true, select: "-password -refreshToken" }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong",
        });
    }
};

export const changeCurrentPassword = async (req, res) => {

    try {
        const { currentPassword, newPassword } = req.body

        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

        if (!isPasswordCorrect) {
            return res
                .status(400)
                .json({
                    message: "Invalid Old Password"
                })
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json({
                message: "Password changed successfully"
            })
    } catch (error) {
        return res
            .status(500)
            .json({
                message: error?.message
            })
    }
}

export const updateUserAvatar = async (req, res) => {
    try {
        // console.log(req.file)
        const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath) {
            return res
                .status(400)
                .json({
                    message: "avatar file is missing"
                })
        }

        const user = await User.findById(req.user?._id);

        if (user?.avatar) {
            const segments = user.avatar.split("/");
            const fileWithExtension = segments[segments.length - 1];
            const publicId = fileWithExtension.split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log(avatar)

        if (!avatar.url) {
            return res
                .status(400)
                .json({
                    message: "Error while uploading avatar"
                })
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json({
                updatedUser,
                message: "Avatar image updated successfully"
            });
    } catch (error) {
        return res.status(500).json({ message: error?.message });
    }
};

export const savePushSubscription = async (req, res) => {
    try {
      const user = req.user;
  
      user.pushSubscription = req.body.subscription;
      await user.save();
  
      res.status(200).json({ message: "Push subscription saved successfully" });
    } catch (err) {
      console.error("Error saving push subscription:", err);
      res.status(500).json({ message: "Failed to save push subscription" });
    }
  };
  