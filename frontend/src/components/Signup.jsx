import React from 'react'
import { FiLoader } from "react-icons/fi";
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

function Signup() {

    const {signup, isSigningUp, } = useAuthStore()
    const navigate = useNavigate()



    const handleForm = (e) =>{
        e.preventDefault()
        const name = e.target[0].value
        const surname = e.target[1].value
        const email = e.target[2].value
        const password = e.target[3].value
   
        if(!email || !password || !name || !surname){return toast.error('Invalid Credentials')}
   
        signup(name, surname, email, password, navigate)
       }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
  <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg space-y-6">
    <div className="text-center mb-4">
      <h1 className="text-3xl font-bold text-indigo-600">ChatApp</h1>
      <p className="text-gray-500">Real-time chat made simple</p>
    </div>
    <form onSubmit={handleForm} className="flex flex-col gap-2">
      <div className="flex flex-col items-start">
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Name</label>
        <input type="text" id="name" name="name" placeholder="Enter your name" className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
      </div>
      <div className="flex flex-col items-start">
        <label htmlFor="surname" className="block text-sm font-semibold text-gray-700">Surname</label>
        <input type="text" id="surname" name="surname" placeholder="Enter your surname" className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
      </div>
      <div className="flex flex-col items-start">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
        <input type="email" id="email" name="email" placeholder="Enter your email" className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
      </div>
      <div className="flex flex-col items-start">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
      </div>
    
      <div>
        <button type="submit" className={` flex justify-center items-center min-h-[50px] w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isSigningUp ? 'disabled' : ''}`}>{isSigningUp ? <FiLoader className='animate-spin'/> : 'Login'}</button> 
      </div>
    </form>
    <div className="text-center text-sm text-gray-600">
      <p>Already have an account? <Link className="text-sm text-indigo-600 hover:text-indigo-800" to={'/login'}>Login</Link></p>
    </div>
  </div>
</div>

  )
}

export default Signup