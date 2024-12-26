import { toast } from 'react-toastify';

const useToast = () => {

  const toastOptions = {
    position: 'top-middle',
    autoClose: 5000,
    hideProgressBar: false,
    theme: 'light',
  };

  const toastMethods = {

    success: (message) => {
      console.log('success called')
      toast.success(message, {autoClose:400, theme:'dark', className: 'rounded-full'});
    },

    error: (message) => {
      toast.error(message, toastOptions);
    },

    info: (message) => {
      toast.info(message, toastOptions);
    },

    warn: (message) => {
      toast.warn(message, toastOptions);
    },

  };

  return toastMethods; 
};

export default useToast;
