import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, undeliveredMsgsQueue } from "../lib/socket.js"
import Message from "../models/messageModel.js" 
import User from "../models/userModel.js"   

const uploadImagesToCloudinary = async (base64Images,senderId, receiverId) => {

  try {
    const uploadPromises = base64Images.map((base64Image) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload( base64Image, {resource_type: 'auto'}, (error, result) => {
                                                                                                  if (error) {
                                                                                                    reject(error);
                                                                                                  } else {
                                                                                                     
                                                                                                    resolve(result.secure_url); 
                                                                                                  }
                                                                                              }
        );
      });
    });

    // Wait for all uploads to finish
    const secureUrls = await Promise.all(uploadPromises);

    return secureUrls; // Returning the array of secure URLs
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
}; 
   

export const sendMessage = async (req, res) =>{
   const {senderId, receiverId, text, base64Images } = req.body

 

   if(base64Images.length > 0)  // sending images with text through socket io first and then saving msg to database so that images are delivered in no time
   {
    const receiverSocketId = getReceiverSocketId(receiverId)
    base64Images.map((base64Image, index)=>{
 
     const message1 = new Message({
       senderId:senderId,
       receiverId:receiverId,
       text: index == base64Images.length -1 ? text : '',
       images: base64Images[index],
       delivered:false,
       seen:false,
       createdAt: new Date(),
       updatedAt: new Date()
      }) 

      io.to(receiverSocketId).emit('newMessage', message1)
 
    })


    uploadImagesToCloudinary(base64Images, senderId, receiverId)
    .then(async (secureUrls) => {
  
      const message2 = new Message({
        senderId:senderId,
        receiverId:receiverId,
        text:text,
        images:secureUrls
       })  
       
       const savedMessage = await message2.save()
  
       
       if(savedMessage?._id){
  
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
    
        if (!sender || !receiver) {
            return res.status(404).json({ error: "User not found" });
          }
    
          const senderRecentChats = sender.recentChats || [];
          const receiverRecentChats = receiver.recentChats || [];
    
          const existingReceiverIndex = senderRecentChats.findIndex((chat) =>{
            return chat._id.toString() === receiverId.toString()
          } 
          ); 
    
          const existingSenderIndex = receiverRecentChats.findIndex((chat)=>{
            return chat._id.toString() === senderId.toString()
          })
    
          if(existingSenderIndex != -1){
            receiver.recentChats.splice(existingSenderIndex, 1)
          }
    
          if (existingReceiverIndex !== -1) {
            sender.recentChats.splice(existingReceiverIndex, 1);
          }
    
          receiverRecentChats.unshift({
            _id: senderId,
            name: sender.name, 
            surname: sender.surname, 
            lastMessage: text,
            lastMessageTime: Date.now(),
            lastSeen:sender.lastSeen,
            profileImage:sender.profileImage
          })
    
          senderRecentChats.unshift({
            _id: receiverId,  
            name: receiver.name,
            surname: receiver.surname, 
            lastMessage: text,
            lastMessageTime: Date.now(),
            lastSeen:receiver.lastSeen,
            profileImage:receiver.profileImage
          }) 
    
      
          await User.findByIdAndUpdate(receiverId, { recentChats: receiverRecentChats });
          await User.findByIdAndUpdate(senderId, { recentChats: senderRecentChats });
    
          const receiverSocketId = getReceiverSocketId(receiverId)
    
          if(receiverSocketId){
            // io.to(receiverSocketId).emit('newMessage', message2)   
            // here don't send message through socket io if images exist. we have sent them through socket io already one by one. only want to save 
          }
          else{
            if (!undeliveredMsgsQueue[receiverId]) {
              undeliveredMsgsQueue[receiverId] = [];
          } 
          undeliveredMsgsQueue[receiverId].push(savedMessage);
    
          }
    
         return res.status(200).json({success:'Message sent', savedMessage:savedMessage})
  
        }
  
       res.status(500).json({error:'Message sending failed'})
  
  
    })
    .catch((error) => {
      res.status(500).json({error:'Could not upload images to cloudinary'})
    });

   }
   else  // else if there is only text then sending text after saving the message to maintain consistency
   {
       
    const message2 = new Message({
      senderId:senderId,
      receiverId:receiverId,
      text:text,
      images:base64Images
     })  
     
     const savedMessage = await message2.save()

     
     if(savedMessage?._id){

      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
  
      if (!sender || !receiver) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const senderRecentChats = sender.recentChats || [];
        const receiverRecentChats = receiver.recentChats || [];
  
        const existingReceiverIndex = senderRecentChats.findIndex((chat) =>{
          return chat._id.toString() === receiverId.toString()
        } 
        ); 
  
        const existingSenderIndex = receiverRecentChats.findIndex((chat)=>{
          return chat._id.toString() === senderId.toString()
        })
  
        if(existingSenderIndex != -1){
          receiver.recentChats.splice(existingSenderIndex, 1)
        }
  
        if (existingReceiverIndex !== -1) {
          sender.recentChats.splice(existingReceiverIndex, 1);
        }
  
        receiverRecentChats.unshift({
          _id: senderId,
          name: sender.name, 
          surname: sender.surname, 
          lastMessage: text,
          lastMessageTime: Date.now(),
          lastSeen:sender.lastSeen,
          profileImage:sender.profileImage
        })
  
        senderRecentChats.unshift({
          _id: receiverId,  
          name: receiver.name,
          surname: receiver.surname, 
          lastMessage: text,
          lastMessageTime: Date.now(),
          lastSeen:receiver.lastSeen,
          profileImage:receiver.profileImage
        }) 
  
    
        await User.findByIdAndUpdate(receiverId, { recentChats: receiverRecentChats });
        await User.findByIdAndUpdate(senderId, { recentChats: senderRecentChats });
  
        const receiverSocketId = getReceiverSocketId(receiverId)
  
        if(receiverSocketId){
          io.to(receiverSocketId).emit('newMessage', message2)
          //here images are not present so we are sending message throu socket io after saving message to database
        }
        else{
          if (!undeliveredMsgsQueue[receiverId]) {
            undeliveredMsgsQueue[receiverId] = [];
        } 
        undeliveredMsgsQueue[receiverId].push(savedMessage);
  
        }
   
       return res.status(200).json({success:'Message sent', savedMessage:savedMessage})

      }

     res.status(500).json({error:'Message sending failed'})


   } 
                                                                                                     


  //  uploadImagesToCloudinary(base64Images, senderId, receiverId)
  // .then(async (secureUrls) => {



  //   const message2 = new Message({
  //     senderId:senderId,
  //     receiverId:receiverId,
  //     text:text,
  //     images:secureUrls
  //    })  
     
  //    const savedMessage = await message2.save()

     
  //    if(savedMessage?._id){

  //     const sender = await User.findById(senderId);
  //     const receiver = await User.findById(receiverId);
  
  //     if (!sender || !receiver) {
  //         return res.status(404).json({ error: "User not found" });
  //       }
  
  //       const senderRecentChats = sender.recentChats || [];
  //       const receiverRecentChats = receiver.recentChats || [];
  
  //       const existingReceiverIndex = senderRecentChats.findIndex((chat) =>{
  //         return chat._id.toString() === receiverId.toString()
  //       } 
  //       ); 
  
  //       const existingSenderIndex = receiverRecentChats.findIndex((chat)=>{
  //         return chat._id.toString() === senderId.toString()
  //       })
  
  //       if(existingSenderIndex != -1){
  //         receiver.recentChats.splice(existingSenderIndex, 1)
  //       }
  
  //       if (existingReceiverIndex !== -1) {
  //         sender.recentChats.splice(existingReceiverIndex, 1);
  //       }
  
  //       receiverRecentChats.unshift({
  //         _id: senderId,
  //         name: sender.name, 
  //         surname: sender.surname, 
  //         lastMessage: text,
  //         lastMessageTime: Date.now(),
  //         lastSeen:sender.lastSeen,
  //         profileImage:sender.profileImage
  //       })
  
  //       senderRecentChats.unshift({
  //         _id: receiverId,  
  //         name: receiver.name,
  //         surname: receiver.surname, 
  //         lastMessage: text,
  //         lastMessageTime: Date.now(),
  //         lastSeen:receiver.lastSeen,
  //         profileImage:receiver.profileImage
  //       }) 
  
    
  //       await User.findByIdAndUpdate(receiverId, { recentChats: receiverRecentChats });
  //       await User.findByIdAndUpdate(senderId, { recentChats: senderRecentChats });
  
  //       const receiverSocketId = getReceiverSocketId(receiverId)
  
  //       if(receiverSocketId){
  //         io.to(receiverSocketId).emit('newMessage', message2)
  //       }
  //       else{
  //         if (!undeliveredMsgsQueue[receiverId]) {
  //           undeliveredMsgsQueue[receiverId] = [];
  //       } 
  //       undeliveredMsgsQueue[receiverId].push(savedMessage);
  
  //       }
  
  //      return res.status(200).json({success:'Message sent', savedMessage:savedMessage})

  //     }

  //    res.status(500).json({error:'Message sending failed'})


  // })
  // .catch((error) => {
  //   res.status(500).json({error:'Could not upload images to cloudinary'})
  // });
 


} 

export const sendMessageWithUploadedImages = async (req, res) =>{
  const {senderId, receiverId, text, images, messageId } = req.body
  
      
   const message2 = new Message({
     senderId:senderId,
     receiverId:receiverId,
     text:text,
     images:images, 
     messageId:messageId

    })   

    
    
    const savedMessage = await message2.save()


    const receiverSocketId = getReceiverSocketId(receiverId)
     
    if(receiverSocketId){
      io.to(receiverSocketId).emit('newMessage', savedMessage)
    }
    else{
      if (!undeliveredMsgsQueue[receiverId]) {
        undeliveredMsgsQueue[receiverId] = [];
    } 
    undeliveredMsgsQueue[receiverId].push(savedMessage);

    }
  
    
    if(savedMessage?._id){ 

     const sender = await User.findById(senderId);
     const receiver = await User.findById(receiverId);
 
     if (!sender || !receiver) {
         return res.status(404).json({ error: "User not found" });
       }
 
       const senderRecentChats = sender.recentChats || [];
       const receiverRecentChats = receiver.recentChats || [];
 
       const existingReceiverIndex = senderRecentChats.findIndex((chat) =>{
         return chat._id.toString() === receiverId.toString()
       } 
       ); 
 
       const existingSenderIndex = receiverRecentChats.findIndex((chat)=>{
         return chat._id.toString() === senderId.toString()
       })
 
       if(existingSenderIndex != -1){
         receiver.recentChats.splice(existingSenderIndex, 1)
       }
 
       if (existingReceiverIndex !== -1) {
         sender.recentChats.splice(existingReceiverIndex, 1);
       }
 
       receiverRecentChats.unshift({
         _id: senderId,
         name: sender.name, 
         surname: sender.surname, 
         lastMessage: text,
         lastMessageTime: Date.now(),
         lastSeen:sender.lastSeen,
         profileImage:sender.profileImage
       })
 
       senderRecentChats.unshift({
         _id: receiverId,  
         name: receiver.name,
         surname: receiver.surname, 
         lastMessage: text,
         lastMessageTime: Date.now(),
         lastSeen:receiver.lastSeen,
         profileImage:receiver.profileImage
       }) 
 
   
       await User.findByIdAndUpdate(receiverId, { recentChats: receiverRecentChats });
       await User.findByIdAndUpdate(senderId, { recentChats: senderRecentChats });
 
      //  const receiverSocketId = getReceiverSocketId(receiverId)
 
      //  if(receiverSocketId){
      //    io.to(receiverSocketId).emit('newMessage', message2)
      //  }
      //  else{
      //    if (!undeliveredMsgsQueue[receiverId]) {
      //      undeliveredMsgsQueue[receiverId] = [];
      //  } 
      //  undeliveredMsgsQueue[receiverId].push(savedMessage);
 
      //  }
  
      return res.status(200).json({success:'Message sent', savedMessage:savedMessage})

     }

    res.status(500).json({error:'Message sending failed'})


  
                                                                                                    


} 
 
export const getMessages = async(req, res) =>{
    const {loggedInUserId, selectedUserId } = req.body
    try {

      const messages = await Message.find({
        $or:[
                {senderId:loggedInUserId, receiverId:selectedUserId},
                {senderId:selectedUserId, receiverId:loggedInUserId}
            ]
      }).sort({createdAt:1})

    res.status(200).json({success:'Got messages successfully', messages:messages})
        
    } catch (error) {
        return res.status(500).json({error:"Error getting msgs"})
    }
}  

export const searchUsers = async (req, res) => {
    try {
        const { email } = req.body;
   
        if (email) {
            const users = await User.find({ 
                email: { 
                    $regex: `^${email}`,  // Start of email must match the input (case-sensitive)
                    $options: 'i'         // Case-insensitive search
                }
            }).select("-password")   
            if (users.length > 0) { 
                return res.status(200).json({success:'Users found', users:users});
            } else {
                return res.status(404).json({ error: 'No users found with that email' });
            }
        } else { 
            return res.status(400).json({ error: 'Email is required', users:[] });
        } 
    } catch (error) {     
        console.error('Error during user search:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};   

export const getUser = async (req, res) => {
  try {
      const { _id } = req.body;

 
      if (_id) {
          const user = await User.findOne({ _id : _id }).select("-password -recentChats")   
          if (user._id ) { 
              return res.status(200).json({success:'Users found', user:user});
          } else {
              return res.status(404).json({ error: 'No user found' });
          }
      } else { 
          return res.status(400).json({ error: 'No _id provided while getting user info', user:{} });
      } 
  } catch (error) {     
      console.error('Error during user search:', error);
      return res.status(500).json({ error: 'Server error' });
  }
};   
 