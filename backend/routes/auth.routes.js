import express from "express"
import { check, getUsers, login, logout, sighup, updateProfile } from "../controllers/auth.controllers.js"
import { authProtector } from "../middleware/auth.protected.js"



const authRoutes = express.Router()

authRoutes.post("/sighup", sighup)
authRoutes.post("/login", login)
authRoutes.post("/logout", logout)
authRoutes.post("/check", authProtector, check)
authRoutes.post("/getUsers", authProtector,  getUsers )
authRoutes.post("/updateProfile", authProtector,  updateProfile )


export default authRoutes  