import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ScrollReveal from '../components/ScrollReveal';

const Privacy: React.FC = () => {
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
            <h1 className={`text-4xl font-heading font-bold ${isDark ? 'text-amber-400' : 'text-primary-tea'} mb-4`}>Privacy Policy</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Last updated: February 2026</p>
          </div>

        <div className="prose prose-tea max-w-none">
          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>1. Introduction</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Date Maple Coffee is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website or use our services. 
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>2. Information We Collect</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We collect information that you provide directly to us, including:
            </p>
            <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 ml-4 space-y-1`}>
              <li>Personal identification information (Name, email address, phone number)</li>
              <li>Billing and delivery address</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Order history and preferences</li>
              <li>Communications with us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>3. How We Use Your Information</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We use the information we collect to:
            </p>
            <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 ml-4 space-y-1`}>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>4. Information Sharing</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We do not sell, trade, or otherwise transfer your personally identifiable information to third parties 
              without your consent, except as described in this policy. We may share your information with:
            </p>
            <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 ml-4 space-y-1`}>
              <li>Service providers who assist us in operating our website and conducting our business</li>
              <li>Payment processors to complete transactions</li>
              <li>Delivery partners to fulfill orders</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>5. Data Security</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We implement appropriate technical and organizational security measures to protect your personal information. 
              However, please note that no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>6. Your Rights</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              You have the right to:
            </p>
            <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 ml-4 space-y-1`}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>7. Cookies</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>8. Changes to This Policy</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-dark-tea'} mb-4`}>9. Contact Us</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              If you have any questions about this Privacy Policy, please contact us at{' '}
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

export default Privacy;
