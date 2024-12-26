import express from 'express'
import { getMessages, getUser, searchUsers, sendMessage } from '../controllers/message.controllers.js'

const messageRoutes = express.Router()

messageRoutes.post('/sendMessage', sendMessage)
messageRoutes.post('/getMessages', getMessages)
messageRoutes.post('/searchUsers', searchUsers)
messageRoutes.post('/getUser', getUser)


export default messageRoutes