import React, { useEffect, useRef, useState } from 'react'
import { BiCheck, BiCheckDouble } from "react-icons/bi";
import { MdAttachment } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import useAuthStore from '../store/useAuthStore'
import chatImage from '../assets/chatImage.jpg'

import { Link, useNavigate } from 'react-router-dom'
import useMessageStore from '../store/useMessageStore'
import useCloudinaryStore from '../store/useCloudinaryStore';
const { VITE_BACKEND_URL } = import.meta.env;


let typingTimer = null;

function Home() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState('')
  const [previewImages, setPreviewImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const { uploadImages, uploadedUrls, setUploadedUrls, loading, error, numberOfFileSelected } = useCloudinaryStore()
  const { logout, check, loggedInUser, onlineUsers, socket } = useAuthStore()
  const { sendMessage, sendMessageWithUploadedImages, getMessages, convertImagesToBase64Urls, isImagesConverting, base64Images, emitTyping, emitNotTyping, usersTyping, messages, searchUsers, users, setUsers, setSelectedUser, selectedUser, getSelectedUser, listenToMessages, dontListenToMessages, recentChats, emitSeen } = useMessageStore()
  const navigate = useNavigate()
  const scrollSpan = document.getElementById('scrollSpan');
  const imageInputRef = useRef(null)
  const textInputRef = useRef(null)

  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [uploadedUrls, loading, error, numberOfFileSelected])

  useEffect(() => {                                                                          //scrolling messages to end when messages object
    if (scrollSpan) {
      scrollSpan.scrollIntoView({ behavior: 'smooth', block:'end' });
    }
    console.log(messages)
  }, [messages])

  useEffect(() => {                                                                          // observing all unSeen messages elements to deliver seen report

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('seen', 'true')

          if (selectedUser._id) {
            emitSeen(selectedUser._id, entry.target.getAttribute('messageId'))
          }
          observer.unobserve(entry.target);
        }
      })
    })

    const unreadMessageElements = document.querySelectorAll('div[seen="false"]');

    Array.from(unreadMessageElements).map((unreadMessageElement) => {
      observer.observe(unreadMessageElement)
    })


    return () => {
      unreadMessageElements.forEach(element => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };

  }, [messages])

  useEffect(() => {

    if (socket && socket.connected) {
      listenToMessages()
    }

    return () => dontListenToMessages()

  }, [listenToMessages, dontListenToMessages, loggedInUser, socket])

  useEffect(() => {
    if (loggedInUser && selectedUser) {
      getMessages(loggedInUser._id, selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (email != '') { searchUsers(email) }
    if (email == '') { setUsers([]) }
  }, [email])

  useEffect(() => {
    check(navigate)
  }, [])

  const handleChange = (event) => {
    emitTyping()

    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    typingTimer = setTimeout(() => {
      emitNotTyping()
    }, 2000);
  };

  const handleButtonClick = () => {

  }




  return (
    <div className="MAIN h-full w-full flex bg-slate-500 ">

      <div className="SIDEBAR flex flex-col w-[30%] h-full border-r border-gray-700 bg-gray-800">

        <div className="flex items-center justify-between p-4 bg-gray-800">
          <span className='flex items-center gap-4'>
            <Link to={'/profile'} > <img src={loggedInUser?.profileImage} alt="" className='w-[50px] h-[50px] rounded-full object-cover' /> </Link>
            <h2 className="text-lg font-semibold text-gray-200 capitalize">{loggedInUser?.name}</h2>
          </span>
          <button className="text-blue-400 hover:text-blue-600" onClick={() => { logout(navigate) }}>Log out</button>
        </div>

        <div className="SEARCHBAR p-4">
          <div className="flex items-center bg-gray-700 p-2 rounded-lg mt-2">
            <input
              id="search-email"
              type="text"
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none"
              placeholder="Search by email"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
            />
          </div>

          <ul className=' w-[100%]  flex flex-col gap-2'>
            {
              users.length > 0 && users.map((user, index) => {
                if (user._id !== loggedInUser._id) {
                  return <li key={index} className='cursor-pointer flex items-center gap-2 text-white text-sm shadow-lg p-2 rounded-md truncate capitalize ' onClick={() => { setSelectedUser(user); setEmail('') }}> <img className='min-w-[30px] max-h-[30px] object-cover border-black border-2 rounded-full' src={user.profileImage} alt="" /> {`${user.name} ${user.surname} - ( ${user.email} )`} </li>
                }
              })
            }
          </ul>
        </div>


        <div className="RECENT-CHATS   overflow-y-auto no-scrollbar ">

          {
            recentChats && recentChats.length > 0 && recentChats.map((chat, index) => {
              const lastMessageTime = new Date(chat.lastMessageTime).toLocaleTimeString()
              return <div key={index} className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700" onClick={() => { getSelectedUser(chat._id) }}>
                <div className="flex items-center">
                  <div className='w-12 h-12 relative '>
                    <img className={`w-12 h-12  rounded-full object-cover relative `} src={chat.profileImage !== '' ? chat.profileImage : "https://via.placeholder.com/40"} alt="Profile" />
                    <p className={`w-3 h-3  rounded-full absolute top-[0.5%] shadow-inner shadow-black ${onlineUsers.includes(chat._id) ? 'bg-green-500' : 'bg-red-600'}`}></p>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-200">{chat.name}</h3>
                      <span className="text-xs text-gray-400">{lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{usersTyping.includes(chat._id) ? <span className='text-green-500'>typing...</span> : chat.lastMessage == '' ? 'Image' : chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            })
          }



        </div>

      </div>

      {
        selectedUser ?
          <div className="CHAT-WINDOW w-[70%] h-full  flex flex-col">

            {
              selectedUser && <div className="CHAT-HEADER flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profileImage !== '' ? selectedUser.profileImage : "https://via.placeholder.com/40"}
                    alt="Chat Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-200">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-400">{onlineUsers.includes(selectedUser._id) ? `${usersTyping.includes(selectedUser._id) ? 'typing...' : 'online'}` : selectedUser.lastSeen}</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-600">More</button>
              </div>
            }

            {
              selectedUser && <div className="MESSAGES h-[600px] overflow-y-auto no-scrollbar px-4 pt-4 bg-gray-900">

                {

                  messages.length > 0 && messages.map((message, index) => {

                    const messageTime = new Date(message.createdAt).toLocaleTimeString()

                    if (message.senderId === loggedInUser._id) {
                      return <div key={index} className="mt-4 text-right">

                        <div className='flex justify-end'>
                          <div className="bg-gray-800  text-white p-3 rounded-lg max-w-[400px] flex flex-col">
                            {
                              message.images?.length > 0 && <div className='flex flex-wrap justify-start gap-2 mb-2 '>
                                {
                                  message.images.map((image, i) => {
                                    return <img key={i} className='w-[175px] h- object-cover rounded-md' src={image} alt="" />
                                  })
                                }
                              </div>
                            }
                            <p className="text-sm break-words text-wrap text-start">{message.text}</p>
                          </div>
                        </div>
                        <span className="text-xs  text-gray-400  flex justify-end items-center gap-3 min-h-[30px] pr-2 "> <span>{messageTime}</span> {!message.delivered && !message.seen ? <span className='inline-block text-xl text-white checkmark '><BiCheck /></span> : ''} {message.delivered && !message.seen ? <span className='inline-block text-xl text-white checkmark '><BiCheckDouble /></span> : ''} {message.delivered && message.seen ? <span className='inline-block text-green-600 text-xl checkmark '><BiCheckDouble /></span> : ''} </span>

                      </div>
                    }
                    else {
                      return <div key={index} seen={message.seen ? 'true' : 'false'} messageid={message._id} className="mt-4">
                                <div className='flex justify-start'>
                                  <div className="bg-gray-800  text-white p-3 rounded-lg max-w-[400px] flex flex-col">
                                    {
                                      message.images.length > 0 && <div className='flex flex-wrap justify-start gap-2 mb-2 '>
                                        {
                                          message.images.map((image, i) => {
                                            return <img key={i} className='w-[175px] h- object-cover rounded-md' src={image} alt="" />
                                          })
                                        }
                                      </div>
                                    }
                                    <p className="text-sm break-words text-wrap text-start">{message.text}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400">{messageTime}</span>
                             </div>
                    }

                  })

                }

                <span id='scrollSpan' className=''></span>

              </div>
            }


            {
              loading && numberOfFileSelected > 0 && <div className="IMAGE-PRIVIEW-SKELETON min-h-[90px] flex items-center gap-2 p-2 bg-slate-800 no-scrollbar overflow-auto">
                {
                  Array(numberOfFileSelected).fill(0).map((dummyImage, index) => {
                    return <span key={index} className='w-[70px] h-[70px] rounded shadow-lg flex justify-center items-center flex-col gap-1'> <FiLoader className='animate-spin text-white' /> <p className='text-[9px] text-white'>Loading...</p> </span>
                  })
                }
              </div>
            }


            {
              !loading && uploadedUrls.length > 0 && <div className="IMAGE-PRIVIEW min-h-[90px] flex items-center gap-2 p-2 bg-slate-800 no-scrollbar overflow-auto">
                {
                  uploadedUrls.map((imageUrl, index) => {
                    return <img key={index} src={imageUrl} className='w-[70px] h-[70px] object-cover rounded shadow-lg' alt="" />
                  })
                }
              </div>
            }

            {
              selectedUser && <div className="INPUT-SECTION border-t border-gray-700 p-4 bg-gray-800">
                <div className="flex ">
                  <input
                    ref={textInputRef}
                    type="text"
                    className="flex-1  border-gray-600 rounded-l-lg p-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); handleChange() }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && message.trim() !== "" && !loading) {
                        e.preventDefault();
                        sendMessageWithUploadedImages(loggedInUser._id, selectedUser._id, message, uploadedUrls);
                        // sendMessage(loggedInUser._id, selectedUser._id, message, base64Images);
                        setMessage('');
                        setPreviewImages([]);
                        imageInputRef.current.value = ''
                      }
                    }}

                  />

                  {/* <input ref={imageInputRef} id='imageInput' className='hidden' type="file" accept='image/*' onChange={(e)=>{convertImagesToBase64Urls(e); setPreviewImages(Array.from(e.target.files))}} multiple /> */}
                  <input ref={imageInputRef} id='imageInput' className='hidden' type="file" accept='image/*' onChange={(e) => { uploadImages(e.target.files) }} multiple />
                  <label htmlFor="imageInput" className=' flex justify-center items-center  p-1 bg-gray-700 cursor-pointer'><MdAttachment className='w-[30px] h-[20px] text-white' /></label>
                  <button disabled={loading} className={` text-white p-2 rounded-r-lg hover:bg-blue-600 ${loading ? 'cursor-not-allowed disabled bg-slate-400' : 'bg-blue-500'}`} onClick={() => { sendMessageWithUploadedImages(loggedInUser._id, selectedUser._id, message, uploadedUrls); setMessage(''); setPreviewImages([]); imageInputRef.current.value = ''; }}>Send</button>
                  {/* <button disabled={loading} className={` text-white p-2 rounded-r-lg hover:bg-blue-600 ${loading ? 'cursor-not-allowed disabled bg-slate-400' : 'bg-blue-500'}`} onClick={() => {  sendMessage(loggedInUser._id, selectedUser._id, message, base64Images); setMessage(''); setPreviewImages([]); imageInputRef.current.value = ''; }}>Send</button> */}
                </div>
              </div>
            }

          </div>

          :

          <div className='h-full w-[70%] bg-black'>
    //todo : add chat window background image
          </div>
      }

    </div>
  );






}

export default Home