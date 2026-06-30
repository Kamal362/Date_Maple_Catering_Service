import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          padding: '16px',
          borderRadius: '12px',
          background: '#FFF8E1',
          color: '#5D4037',
          border: '1px solid #D2B48C',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          iconTheme: {
            primary: '#8B4513',
            secondary: '#FFF8E1',
          },
        },
        error: {
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          },
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FEF2F2',
          },
        },
        loading: {
          style: {
            background: '#FFF8E1',
            color: '#5D4037',
            border: '1px solid #D2B48C',
          },
          iconTheme: {
            primary: '#8B4513',
            secondary: '#FFF8E1',
          },
        },
      }}
    />
  );
};

export default ToastContainer;