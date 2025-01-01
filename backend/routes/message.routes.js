import express from 'express'
import { getMessages, getUser, searchUsers, sendMessage, sendMessageWithUploadedImages } from '../controllers/message.controllers.js'

const messageRoutes = express.Router()

messageRoutes.post('/sendMessage', sendMessage)
messageRoutes.post('/sendMessageWithUploadedImages', sendMessageWithUploadedImages)
messageRoutes.post('/getMessages', getMessages)
messageRoutes.post('/searchUsers', searchUsers)
messageRoutes.post('/getUser', getUser)


export default messageRoutes