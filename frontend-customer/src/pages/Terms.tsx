import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ScrollReveal from '../components/ScrollReveal';

const Terms: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-cream'} py-12 px-4 transition-colors duration-300`}>
      <ScrollReveal direction="up">
        <div className={`max-w-4xl mx-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 md:p-12`}>
          <div className="mb-8">
            <Link to="/" className={`${isDark ? 'text-amber-400' : 'text-primary-tea'} hover:underline flex items-center gap-2 mb-6`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
            </Link>
            <h1 className={`text-4xl font-heading font-bold ${isDark ? 'text-amber-400' : 'text-primary-tea'} mb-4`}>Terms of Service</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Last updated: February 2026</p>
          </div>

          <div className="prose prose-tea max-w-none">
          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>1. Acceptance of Terms</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              By accessing and using Date Maple Coffee services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>2. Use of Service</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, 
              restrict or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes harassing 
              or causing distress or inconvenience to any other user, transmitting obscene or offensive content, 
              or disrupting the normal flow of dialogue within our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>3. Account Registration</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              To access certain features of our service, you may be required to register for an account. 
              You agree to provide accurate, current, and complete information during the registration process 
              and to update such information to keep it accurate, current, and complete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>4. Orders and Payments</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              All orders placed through our website are subject to acceptance and availability. 
              We reserve the right to refuse or cancel any order for any reason. Prices are subject to change 
              without notice. Payment must be received prior to the acceptance of an order.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>5. Cancellation and Refunds</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Orders may be cancelled within 15 minutes of placement. Refunds will be processed according 
              to our refund policy and may take 5-10 business days to appear in your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>6. Limitation of Liability</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Date Maple Coffee shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of or inability to use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>7. Changes to Terms</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting to the website. Your continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>8. Contact Information</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@datemaple.com" className={`${isDark ? 'text-amber-400' : 'text-primary-tea'} hover:underline`}>
                support@datemaple.com
              </a>
            </p>
          </section>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
};

export default Terms;
