import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        default: '', // Default value for name
      },
      surname: {
        type: String,
        default: '', // Default value for surname
      },
      email: {
        type: String,
        default: '', // Default value for email
      },
      password: {
        type: String,
        default: '', // Default value for password
      },
      recentChats: {
        type: Array,
        default: [], // Default value for recentChats
      },
      lastSeen:{
        type: String,
        default: '',
      },
      profileImage:{
        type: String,
        default: '', 
      }
})

const User = mongoose.model('User', userSchema)

export default User