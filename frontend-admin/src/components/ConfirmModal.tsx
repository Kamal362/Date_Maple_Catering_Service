import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  iconType?: 'warning' | 'success' | 'info' | 'error';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600',
  iconType = 'warning'
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    // Don't call onClose here - let the parent component handle it
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (iconType) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      case 'warning':
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6 text-center">
          {getIcon()}
          <div className="flex justify-center items-center mb-4">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">
              {title}
            </h3>
          </div>
          
          <div className="mb-6">
            <p className="text-dark-tea">{message}</p>
          </div>
          
          <div className="flex justify-center space-x-3">
            {cancelText && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`${confirmButtonClass} text-cream px-6 py-2 rounded-md transition-colors`}
            >
              {confirmText}
            </button>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;