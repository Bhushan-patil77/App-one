import { create } from 'zustand'
import { toast } from 'react-toastify';
import useAuthStore from './useAuthStore';



const useMessageStore = create((set, get) => {
  return {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',],
    messages: [],
    users: [],
    isSendingMessage:false,
    selectedUser: null,
    recentChats: null,
    usersTyping:[],
    isImagesConverting:false,
    base64Images:[],

    getMessages: (loggedInUserId, selectedUserId) => {
      try {

        fetch("http://localhost:5000/messageRoutes/getMessages", {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loggedInUserId: loggedInUserId,
            selectedUserId: selectedUserId,
          })
        })
          .then((response) => { return response.json() })
          .then((data) => {
            if (data.error) { return toast.error(data.error) }
            if (data.success) {
              set({ messages: data.messages })
            }
          })

      } catch (error) {
        toast.error('Something went wrong while signing up')
      }
    },

    sendMessage: (senderId, receiverId, text) => {
      set({isSendingMessage:true})
      const {base64Images} = get()
      try {
        if (senderId && receiverId && text != '') {
          fetch("http://localhost:5000/messageRoutes/sendMessage", {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              senderId: senderId,
              receiverId: receiverId,
              text: text,
              base64Images: base64Images
            })
          })
            .then((response) => { return response.json() })
            .then((data) => {
              if (data.error) { return toast.error(data.error) }
              if (data.success) {
                const { messages } = get()
                set({ messages: [...messages, data.savedMessage] })
                set({isSendingMessage:false})
                set({base64Images:[]})
                get().updateRecentChats(receiverId, text, base64Images)
                return toast.success('message sent')
              }
            })
        }

      } catch (e) {
           set({isSendingMessage:false})
           toast.error('Error sending message ')
      }
    },

    searchUsers: (email) => {

      try {
        fetch("http://localhost:5000/messageRoutes/searchUsers", {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email
          })
        })
          .then((response) => { return response.json() })
          .then((data) => {

            if (data.error) { set({ users: [] }) }
            if (data.success) {
              set({ users: data.users })
            }
          })

      } catch (error) {
        toast.error('Something went wrong while signing up')
        set({ users: [] })
      }
    },

    setSelectedUser: (user) => {
      set({ selectedUser: user })
    },

    getSelectedUser: (_id)=>{
      try {

        fetch("http://localhost:5000/messageRoutes/getUser", {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: _id,
          })
        })
          .then((response) => { return response.json() })
          .then((data) => {
            if (data.error) { return toast.error(data.error) }
            if (data.success) {
              set({ selectedUser: data.user })
            }
          })

      } catch (error) {
        toast.error('Something went wrong while getting users info')
      }
    },

    getUser: (_id) =>{
      return new Promise((resolve, reject)=>{

        try {

          fetch("http://localhost:5000/messageRoutes/getUser", {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              _id: _id,
            })
          })
            .then((response) => { return response.json() })
            .then((data) => {
              if (data.error) { toast.error(data.error); reject(data.error) }
              if (data.success) { resolve(data.user) }
            })
  
        } catch (error) {
          toast.error('Something went wrong while getting users info')
          reject(error)
        }


      })
   

    },

    setUsers: (users) => {
      set({ users: users })
    },

    updateRecentChats: async (_id, text, base64Images) => {
      const { recentChats } = get()
      let chatToUpdate = null
      const chatIndex = recentChats.findIndex((chat) => {
        if (chat._id.toString() === _id.toString()) {
          chatToUpdate = chat
          return chat._id.toString() === _id.toString()
        }
      })

      if (chatIndex !== -1) {
        recentChats.splice(chatIndex, 1)
      }
      else{
        chatToUpdate = await get().getUser(_id)
        console.log(chatToUpdate)
        if (!chatToUpdate) {
          console.error("Failed to fetch user with ID:", _id);
          return;
        }
      }

      chatToUpdate.lastMessage = text
      chatToUpdate.lastMessageTime = new Date()
      chatToUpdate.image = base64Images[0]


      set({ recentChats: [chatToUpdate, ...recentChats] })

    },

    setRecentChats: (recentChats) => {
      set({ recentChats: recentChats })
    },

    listenToMessages: () => {
      const socket = useAuthStore.getState().socket;

      if (socket && socket.connected) {

        socket.on('newMessage', (message) => {
          if (get().selectedUser && get().selectedUser._id == message.senderId) {
            set({ messages: [...get().messages, message] })
            socket.emit('deliveredAndSeen', message._id)
          }
          else
          {
            socket.emit('delivered', message._id)
          }
          get().updateRecentChats(message.senderId, message.text, message.image)
          
        })

        socket.on('getUndeliveredMsgs', (message)=>{
          console.log('undelivered msg', message)
        })


        socket.on('typing', (typingUserId)=>{
          const {usersTyping} = get()
          if(usersTyping.includes(typingUserId)){return}
          set({usersTyping:[...get().usersTyping, typingUserId]})
          
        })

        socket.on('notTyping', (notTypingUserId)=>{
          const {usersTyping} = get()
          
          const updatedUsersTyping = usersTyping.filter((userId) => userId !== notTypingUserId);

          set({ usersTyping: updatedUsersTyping });

        })

        socket.on('deliveryReport', (deliveredMessage)=>{
          const {messages} = get()

          const updatedMessages = messages.map((msg)=>{
            if(msg._id === deliveredMessage._id)
            {
              return {...msg, delivered:true}
            }
            return msg
          })
          set({messages:updatedMessages})
        })

        socket.on('seenReport', (seenMessage)=>{
          const {messages} = get()

          

          const updatedMessages = messages.map((msg)=>{
            if(msg._id === seenMessage._id)
            {
              return {...msg, delivered:true, seen:true}
            }
            return msg
          })
          set({messages:updatedMessages})
        })

        socket.on('seen', (messageId)=>{
          const {messages} = get()
          const updatedMessages = messages.map((message)=>{
            if(message._id === messageId)
            {
              return {...message, seen:true}
            }

            return message
          })

          set({messages:updatedMessages})
        })


      }

    },

    emitNotTyping:()=>{
      const socket = useAuthStore.getState().socket
      if (socket && socket.connected) {
        socket.emit('notTyping', get().selectedUser._id)
     }
    },

    emitTyping:()=>{
      const socket = useAuthStore.getState().socket
      if (socket && socket.connected) {
         socket.emit('typing', get().selectedUser._id)
      }
    },

    emitSeen:(seenReportToId, messageId)=>{
      const socket = useAuthStore.getState().socket
      socket.emit('seen', {seenReportToId, messageId})
    },

    dontListenToMessages: () => {
      const socket = useAuthStore.getState().socket;
      if (socket && socket.connected) {
        socket.off('newMessage')
      }
    },

    getFormatedTime: () => {

      const date = new Date(); // current date and time
      let hours = date.getHours(); // get the hour (in 24-hour format)
      const minutes = date.getMinutes(); // get the minutes

      const suffix = hours >= 12 ? 'PM' : 'AM'; // check if it's PM or AM
      hours = hours % 12; // convert to 12-hour format
      hours = hours ? hours : 12; // handle the case where hours = 0 (midnight)

      const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${suffix}`;

      return formattedTime
    },

    convertImagesToBase64Urls: (e)=>{
      set({isImagesConverting:true})
      const selectedImages = e.target.files;
      const selectedImagesArray = Array.from(selectedImages);  // Convert FileList to array
      
      const imagePromises = selectedImagesArray.map((image) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);  // Resolve with Base64 string
          reader.onerror = reject;  // Reject in case of error
          reader.readAsDataURL(image);  // Read image as Base64 string
        });
      });
    
      
      Promise.all(imagePromises)
        .then((base64Images) => {
         set({base64Images:base64Images})
         set({isImagesConverting:false})
        })
        .catch((error) => {
          console.error("Error converting images to Base64", error);
          toast.error("Error converting images to Base64", error)
          set({isImagesConverting:false})
        });

    },
  }
})

export default useMessageStore