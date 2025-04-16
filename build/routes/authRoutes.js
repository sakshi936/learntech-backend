"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/verify", authController_1.verify);
router.post("/forgot-password", authController_1.forgotPassword);
router.post("/reset-password", authController_1.resetPassword);
//basic use of protected route
router.get("/protected", authenticateToken_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        //  user: req.body 
    });
});
exports.default = router;
