import express, { json } from "express"
import authRoutes from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js";
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { io, server, app } from "./lib/socket.js";


dotenv.config()

app.use(cors({ 
  origin: 'https://app-one-client-two.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, // Allow credentials (cookies)
})); 

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/authRoutes", authRoutes)
app.use('/messageRoutes', messageRoutes)

server.listen(process.env.PORT || 8080 , ()=>{
    console.log('Server is running on port ' + process.env.PORT)
    connectDB()
})  