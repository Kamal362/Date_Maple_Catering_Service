import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-tea">
          Account Registration
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-tea">
          Only administrators can create accounts
        </p>
        <p className="mt-2 text-center text-sm text-dark-tea">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-tea hover:text-accent-tea">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-secondary-tea">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-tea">
              <svg className="h-6 w-6 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-dark-tea">Administrator Access Required</h3>
            <div className="mt-2 max-w-xl mx-auto text-sm text-secondary-tea">
              <p>
                New account creation is restricted to administrators only. Please contact your system administrator to create an account for you.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-cream bg-primary-tea hover:bg-accent-tea focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-tea"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
