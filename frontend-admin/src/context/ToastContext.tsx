import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface ToastContextType {
  toast: typeof toast;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster position="top-right" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};