import { toast } from 'react-toastify';
import {create} from 'zustand';
import {io} from 'socket.io-client'
import useMessageStore from './useMessageStore';


const useAuthStore = create((set, get) => {
  return {
    isSigningUp:false,
    isSignedUp:false,
    isLoggingIn:false,
    isLoggedIn:false,
    loggedInUser:null,
    socket:null,
    recentChats:[],
    onlineUsers:[],
  

    signup:(name, surname, email, password, navigate)=>{
        try {
          set({ isSigningUp: true }); 
            fetch("http://localhost:5000/authRoutes/sighup", {
                method:'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json', 
                },
                body:JSON.stringify({
                name:name,
                surname:surname,
                email:email,
                password:password,
              })})
              .then((response)=>{return response.json()})
              .then((data)=>{ 
                console.log(data)
                if(data.error){return toast.error(data.error)}
                if(data.success){
                  set({
                        loggedInUser: data.user,
                        isSignedUp: true,
                        isSigningUp: false,
                      })
                   navigate('/')
                  return toast.success(data.success)
              }
              })
            
        } catch (error) {
            set({isSigningUp:false})
            toast.error('Something went wrong while signing up')
        }
    },

    login:(gmail, password, navigate)=>{
      const setRecentChats = useMessageStore.getState().setRecentChats
        set({ isLoggingIn: true }); 
        fetch("http://localhost:5000/authRoutes/login", {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json', 
            },
            body: JSON.stringify({
              email: gmail,
              password: password,
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            console.log(data)
            if(data.error){ throw new Error(data.error)}
            if(data.success){
                set({
                      loggedInUser: data.user,
                      isLoggedIn: true,
                      isLoggingIn: false,
                 })

                 setRecentChats(data.user.recentChats)
                 get().connectSocket()
                 navigate('/')
                return toast.success(data.success)
            }
          })
          .catch((error) => {
            toast.error(`${error}`)
            set({ isLoggingIn: false });
          });
    },

    logout:(navigate)=>{
      fetch("http://localhost:5000/authRoutes/logout", {
        method:'POST',
        headers: {
          'Content-Type': 'application/json', 
        }
       })
       .then((response)=>{return response.json()})
       .then((data)=>{
         
         if(data.error){toast.error(data.error)}
         if(data.success){
           document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
           toast.success(data.success)
           get().disconnectSocket()
           navigate('/login')
          }
         })
    },

    updateProfile:(url)=>{
      try {
          fetch("http://localhost:5000/authRoutes/updateProfile", {
              method:'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json', 
              },
              body:JSON.stringify({
              profileImageBase64Url:url
            })})
            .then((response)=>{return response.json()})
            .then((data)=>{ 
              console.log(data)
              if(data.error){return toast.error(data.error)}
              if(data.success){
                 console.log('uploaded successfully')
                 navigate('/')
                return toast.success(data.success)
            }
            })
          
      } catch (error) {
          set({isSigningUp:false})
          toast.error('Something went wrong while signing up')
      }
    },

    check:(navigate)=>{
      const setRecentChats = useMessageStore.getState().setRecentChats

          try {

            fetch('http://localhost:5000/authRoutes/check', {
              method: 'POST',
              credentials: 'include',
            })
            .then((response)=>{return response.json()})
            .then((data)=>{
              
              if(data.error){
                toast.error(data.error)
                navigate('/login')
              }
              
              if(data.success){
                set({loggedInUser:data.user})
                setRecentChats(data.user.recentChats)
                get().connectSocket()
                navigate('/')
              }
            })
         
            
        } catch (e) {
          toast.error("Error in authentication ", e)
        }
    },


    connectSocket:()=>{
      const {loggedInUser, socket} = get()
      

      if( socket && socket.connected && loggedInUser){return}


      const newSocket = io('http://localhost:5000', {
        query:{_id:loggedInUser._id}
      })

      newSocket.on('connect', () => {
        toast.success('You are online...')
        set({ socket: newSocket });
      });


      newSocket.on('getOnlineUsers', (data) => {
        set({ onlineUsers: data.onlineUsers });
        const selectedUser = useMessageStore.getState().selectedUser
        const setSelectedUser = useMessageStore.getState().setSelectedUser

        if(selectedUser && data.disconnectedUserId)
        {
           const updatedSelectedUser = {...selectedUser, lastSeen:new Date().toLocaleTimeString()}
           setSelectedUser(updatedSelectedUser)
        }
      });
      


    },

    disconnectSocket:()=>{
      if(get().socket?.connected){
        get().socket.disconnect()
      }
    },
   
  };
});

export default useAuthStore;
