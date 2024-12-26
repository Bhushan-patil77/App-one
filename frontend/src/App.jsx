import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { ClipLoader, ClockLoader, MoonLoader } from 'react-spinners'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import useAuthStore from './store/useAuthStore'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/home'
import Profile from './components/Profile'


function App() {

  const { signup, login, logout, check, isLoggingIn, loggedInUser } = useAuthStore()
  const navigate = useNavigate()


  useEffect(() => {
    check(navigate)
  }, [])




  return (
    <div className='h-screen w-screen'>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>


      <ToastContainer  position="top-center" autoClose={300}  hideProgressBar={false} />

    </div>
  )
}

export default App
