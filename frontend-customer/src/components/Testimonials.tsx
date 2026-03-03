import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';
import { getApprovedReviews, Review } from '../services/reviewService';
import { useTheme } from '../context/ThemeContext';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? 'text-gold fill-current' : 'text-gray-300 fill-current'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();

const avatarColors = [
  'bg-primary-tea', 'bg-accent-tea', 'bg-secondary-tea',
  'bg-yellow-500', 'bg-emerald-500', 'bg-sky-500',
];

const Testimonials: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { theme } = useTheme();

  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [testimonialsContent, approvedReviews] = await Promise.all([
          getHomePageContentBySection('testimonials'),
          getApprovedReviews(),
        ]);
        setContent(testimonialsContent);
        setReviews(approvedReviews);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setContent({
          section: 'testimonials',
          title: 'What Our Customers Say',
          subtitle: 'Real reviews from our valued customers',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchAll();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const defaultContent = {
    title: 'What Our Customers Say',
    subtitle: 'Real reviews from our valued customers',
  };

  const displayContent = content || defaultContent;

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const visibleReviews = reviews.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const sectionBg = theme === 'dark' ? 'bg-gray-900' : 'bg-cream';
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-light-tea';
  const titleColor = theme === 'dark' ? 'text-amber-400' : 'text-primary-tea';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-dark-tea';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-secondary-tea';
  const quoteBoxBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-cream border-light-tea';

  return (
    <section className={`section-padding ${sectionBg} py-20`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-heading font-bold mb-4 ${titleColor}`}>
            {displayContent.title}
          </h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className={`text-lg max-w-2xl mx-auto ${mutedColor}`}>
            {displayContent.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${cardBg} rounded-lg p-8 border animate-pulse`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-secondary-tea"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-secondary-tea rounded w-24"></div>
                    <div className="h-3 bg-secondary-tea rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-secondary-tea rounded"></div>
                  <div className="h-3 bg-secondary-tea rounded w-5/6"></div>
                  <div className="h-3 bg-secondary-tea rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <svg className={`w-16 h-16 mx-auto mb-4 ${mutedColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className={`text-lg font-medium ${mutedColor}`}>No reviews yet</p>
            <p className={`text-sm mt-1 ${mutedColor}`}>Be the first to share your experience!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleReviews.map((review, index) => {
                const firstName = review.user?.firstName ?? 'A';
                const lastName = review.user?.lastName ?? '';
                const colorClass = avatarColors[index % avatarColors.length];
                const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                  <div
                    key={review._id}
                    className={`${cardBg} rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-accent-tea relative group`}
                  >
                    {/* Quote icon */}
                    <div className={`absolute top-0 left-8 transform -translate-y-1/2 ${quoteBoxBg} px-3 py-2 rounded-lg border`}>
                      <svg className="w-6 h-6 text-accent-tea" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-5 mt-6">
                      <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {getInitials(firstName, lastName)}
                      </div>
                      <div>
                        <h3 className={`font-heading font-semibold ${titleColor}`}>
                          {firstName} {lastName}
                        </h3>
                        {review.menuItem?.name && (
                          <p className={`text-xs ${mutedColor}`}>
                            Ordered: {review.menuItem.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className={`${textColor} italic mb-4 leading-relaxed text-sm`}>
                      "{review.comment}"
                    </p>

                    {/* Rating & date */}
                    <div className="flex items-center justify-between">
                      <StarRating rating={review.rating} />
                      <span className={`text-xs ${mutedColor}`}>{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination dots */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary-tea' : 'bg-secondary-tea hover:bg-accent-tea'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Testimonials;