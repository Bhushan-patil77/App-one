// src/lib/cloudinary.js

const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'chatAppUloadPreset');  // Replace with your Cloudinary upload preset
      formData.append('cloud_name', 'dl6kfrhgz');  // Replace with your Cloudinary cloud name
  
      // Make a POST request to Cloudinary API for image upload
      fetch('https://api.cloudinary.com/v1_1/dl6kfrhgz/image/upload', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          resolve(data.secure_url);  // Return the secure URL of the uploaded image
        })
        .catch((err) => {
          reject(err);  // Handle any errors during the upload
        });
    });
  };
  
  export default uploadImageToCloudinary ;
  