import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: 'error' | 'warning' | 'info';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  icon = 'error',
}) => {
  const iconPaths = {
    error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    warning: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${icon === 'error' ? 'red' : icon === 'warning' ? 'amber' : 'blue'}-100 dark:bg-${icon === 'error' ? 'red' : icon === 'warning' ? 'amber' : 'blue'}-900/30 mb-6`}>
          <svg
            className={`w-8 h-8 ${iconColors[icon]}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconPaths[icon]}
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-secondary-tea dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-6 py-3 bg-primary-tea text-cream font-medium rounded-lg hover:bg-accent-tea transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
