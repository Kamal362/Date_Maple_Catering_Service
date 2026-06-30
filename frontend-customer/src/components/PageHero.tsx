import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  bgImage?: string;
  height?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

const heightClasses = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 md:py-24',
  lg: 'py-20 sm:py-24 md:py-32',
};

const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  bgImage,
  height = 'md',
  overlay = true,
}) => {
  return (
    <div className={`relative bg-primary-tea ${heightClasses[height]} overflow-hidden`}>
      {/* Background Image or Gradient */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {overlay && <div className="absolute inset-0 bg-black/50" />}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-tea via-dark-tea to-primary-tea opacity-90" />
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent-tea/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary-tea/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-4 animate-fade-in-down">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl text-light-tea/90 max-w-2xl mx-auto animate-fade-in-up">
            {subtitle}
          </p>
        )}
        {/* Decorative line */}
        <div className="w-20 h-1 bg-accent-tea mx-auto mt-6 animate-scale-in" />
      </div>
    </div>
  );
};

export default PageHero;
