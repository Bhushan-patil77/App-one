import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate()

  const {updateProfile} = useAuthStore()

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set profile picture URL
      setProfilePicture(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.readAsDataURL(file)
     
      reader.onload = () =>{
        const base64Url = reader.result
        setPreviewUrl(base64Url)
        console.log(base64Url)
      }
    }
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
        <div className="flex flex-col justify-center items-center w-[500px] h-[500px] p-6 bg-white rounded-lg shadow-lg">
        {/* Profile Header */}
        <div className="text-center mb-6  ">
            {/* Profile Image with Circle Style */}
            <div className=" mb-4 ">
            <img
                src={previewUrl || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500"
            />
            {/* Input to select new image */}
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
            />
            </div>
        </div>

        {/* User Details */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">Software Engineer</p>
        </div>

        {/* Profile Edit */}
        <div className="mt-4">
            <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={() => {updateProfile(previewUrl)}}
            >
            Update Profile
            </button>
        </div>
        </div>
    </div>
  );
};

export default Profile;
