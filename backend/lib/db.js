import mongoose from "mongoose";

export const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connected...')
    } catch (e) {
        console.log('Error connecting with database...', e)
    }
} 