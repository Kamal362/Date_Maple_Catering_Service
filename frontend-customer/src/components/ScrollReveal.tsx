import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = '',
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const getTransformStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      transitionDelay: `${delay}ms`,
    };

    if (!isVisible) {
      switch (direction) {
        case 'up':
          return { ...baseStyles, opacity: 0, transform: 'translateY(30px)' };
        case 'down':
          return { ...baseStyles, opacity: 0, transform: 'translateY(-30px)' };
        case 'left':
          return { ...baseStyles, opacity: 0, transform: 'translateX(-30px)' };
        case 'right':
          return { ...baseStyles, opacity: 0, transform: 'translateX(30px)' };
        case 'scale':
          return { ...baseStyles, opacity: 0, transform: 'scale(0.9)' };
        case 'none':
          return { ...baseStyles, opacity: 0 };
        default:
          return { ...baseStyles, opacity: 0, transform: 'translateY(30px)' };
      }
    }

    return { ...baseStyles, opacity: 1, transform: 'none' };
  };

  return (
    <div ref={ref} className={className} style={getTransformStyles()}>
      {children}
    </div>
  );
};

export default ScrollReveal;
