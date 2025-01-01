import React, { useState } from 'react';
import { FiLoader } from "react-icons/fi";
import useAuthStore from '../store/useAuthStore';
import defaultProfileImage from '../assets/defaultProfileImage.png'
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate()

  const { updateProfile, loggedInUser, isUpdatingProfile } = useAuthStore()

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set profile picture URL
      setProfilePicture(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.readAsDataURL(file)

      reader.onload = () => {
        const base64Url = reader.result
        setPreviewUrl(base64Url)
      }
    }
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className="flex flex-col justify-center items-center w-[500px] h-[500px] p-6 bg-white rounded-lg  shadow-2xl">
        {/* Profile Header */}
        <div className="text-center mb-6  ">

          <div className=" mb-4 flex flex-col gap-2">

            <label htmlFor="fileInput">  <img src={previewUrl || loggedInUser?.profileImage || defaultProfileImage} alt="Profile" className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 cursor-pointer" /> </label>

            <input id='fileInput' type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer hidden" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold capitalize">{`${loggedInUser?.name} ${loggedInUser?.surname}`}</h2>
              <p className="text-gray-600">Software Engineer</p>
            </div>

          </div>

        </div>

        {/* User Details */}


        {/* Profile Edit */}
        <div className="mt-4">
          <button className={` text-white py-2 px-4 rounded-lg min-w-[100px] min-h-[40px] flex justify-center items-center ${previewUrl != null ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed' }`} disabled={previewUrl == null} onClick={() => { updateProfile(previewUrl, navigate) }}> {isUpdatingProfile ? <FiLoader className='animate-spin'/> : 'Update'} </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
