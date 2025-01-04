import express from "express";
const router = express.Router();

//authonthication middleware
import authMiddleware from "../middleWare/authMiddleware.js";
// user controllers
import { register,login,checkUser,logOut } from "../controller/userController.js";

// register route
router.post("/register", register);
//http://localhost:3003/api/user/check
// login user
router.post("/login", login);

// check user
router.get("/check",authMiddleware,checkUser);
//logout 
router.delete('/logout',logOut);

//user controllers
export default router;
