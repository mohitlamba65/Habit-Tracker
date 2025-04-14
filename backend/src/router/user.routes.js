import express from "express"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUser,
    updateUserAvatar
} from "../controllers/user.controller.js"

import { upload } from "../middleware/multer.middleware.js"

const router = express.Router()

router.post("/register",upload.single("avatar"),registerUser)

router.post("/login", loginUser)
router.get("/me", isAuthenticated, getCurrentUser)
router.post("/logout", isAuthenticated, logoutUser)
router.post("/refresh-token", refreshAccessToken)
router.put("/update-account", isAuthenticated, updateUser);
router.post("/upload-avatar", isAuthenticated,upload.single("avatar"), updateUserAvatar)
router.put("/change-password", isAuthenticated ,changeCurrentPassword)

export default router



