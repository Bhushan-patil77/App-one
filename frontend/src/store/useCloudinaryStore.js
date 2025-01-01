// src/store/cloudinaryStore.js

import {create} from 'zustand';
import  uploadImageToCloudinary  from '../../lib/cloudinary';

const useCloudinaryStore = create((set) => ({
  uploadedUrls: [],   // Store for uploaded image URLs
  loading: false,      // Whether the upload is in progress
  error: null,         // Error state
  numberOfFileSelected:null,

  setLoading: (loading) => set({ loading }),

  setUploadedUrls: (urls) => set({ uploadedUrls: urls }),

  setError: (error) => set({ error }),

  uploadImages: async (files) => {
    set({ loading: true, error: null, numberOfFileSelected:files.length });

    

    try { 
      // Upload each file and get the URL
      const uploadPromises = Array.from(files).map((file) => uploadImageToCloudinary(file));
      const urls = await Promise.all(uploadPromises);

      // Save the URLs to the store
      set({ uploadedUrls: urls, loading: false });
    } catch (error) {
      set({ error: 'Error uploading images', loading: false });
    }
  },
}));

export default useCloudinaryStore;
