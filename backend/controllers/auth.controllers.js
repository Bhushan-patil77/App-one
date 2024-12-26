import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/jwt.js";
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"



export const sighup = async (req, res)=>{
    const {name, surname, email, password, recentChats} = req.body

    const existingUser = await User.findOne({ email });

    if (existingUser) { return res.status(400).json({ error: 'Email is already taken' }) }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        surname,
        email,
        password:hashedPassword,
        recentChats:recentChats
    })

    try {

        const createdUser = await user.save()

        const token =  generateToken({email:email})
        
        res.cookie('token', token , {maxAge:1*60*60*1000});

        const createdUserWithoutPassword = createdUser.toObject();
        delete createdUserWithoutPassword.password;

        res.status(201).json({success:'user created successfully...', user:createdUserWithoutPassword})
        console.log('user created successfully...'+ createdUser)
        
    } catch (error) {
        res.status(400).json({ error: 'Error creating the user...' })
        console.log('error creating user ' + error)
    }
}

export const login = async (req, res)=>{
    const {email, password} = req.body

    try {

        if(!email || !password){return res.status(400).json({error:"All fields are required"})}
         
        const existingUser = await User.findOne({email})

        if(!existingUser){return res.status(404).json({error:"User not found"})}

        const matched = await bcrypt.compare(password, existingUser.password)

        if(!matched){return res.status(400).json({error:"Invalid credentials"})}

        const token =  generateToken({email:email}) 
        
        res.cookie('token', token , {maxAge:1*60*60*1000});

        const existingUserWithoutPassword = existingUser.toObject();
        delete existingUserWithoutPassword.password;


 
        res.status(200).json({success:"Login successfull", user:existingUserWithoutPassword})

        
    } catch (error) {
        return res.status(500).json({error:"Error signing in"})
    }
}

export const updateProfile = async (req, res)=>{
    const {profileImageBase64Url} = req.body
    const userId = res.user._id.toString()
    try 
    {
       if(!profileImageBase64Url){return res.status(500).json({error:'profile picture is not provided'})} 

       const uploadedToCloudinary = await cloudinary.uploader.upload(profileImageBase64Url)

       const profileImageUrl = uploadedToCloudinary.secure_url

       if(profileImageUrl){
        await User.findByIdAndUpdate({_id:userId}, {$set:{profileImage:profileImageUrl}})
        return res.status(200).json({success:'profile photo uploaded successfully'})
        }
    }
     catch (error) {
        return res.status(500).json({error:'something went wrong while uploading profile photo', error})
    }
}

export const logout = (req, res)=>{
    try {
        res.cookie('token', '', {maxAge:0});
        res.status(200).json({success:'Logged out successfully'})
    } catch (error) {
        res.status(500).json({error:"Error logging out "+ error})
    }
}

export const check = (req, res)=>{
    res.status(200).json({success:'User authenticated', user:res.user})
}

export const getUsers = (req, res) =>{
   res.status(200).json({success:'this is get users response with cookites...', user:res.user})
}  