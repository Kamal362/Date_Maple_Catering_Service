import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastContainer: React.FC = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          padding: '16px',
          background: '#363636',
          color: '#fff',
        },
      }}
    />
  );
};

export default ToastContainer;