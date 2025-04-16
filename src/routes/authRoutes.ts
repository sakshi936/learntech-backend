import { Router, Response, Request } from "express";
import { register,login,verify, forgotPassword, resetPassword } from "../controllers/authController";
import { authenticateToken } from "../middleware/authenticateToken";


const router = Router();

router.post("/register",register)
router.post("/login", login)
router.post("/verify", verify)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
//basic use of protected route
router.get("/protected", authenticateToken, (req, res) => {
   res.json({ 
       success: true, 
       message: "Protected route accessed successfully",
      //  user: req.body 
   });
});

export default router;