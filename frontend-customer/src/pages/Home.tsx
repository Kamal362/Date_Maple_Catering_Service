import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import MenuHighlights from '../components/MenuHighlights';
import Catering from '../components/Catering';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Gallery from '../components/Gallery';
import EventFlyers from '../components/EventFlyers';
import ScrollReveal from '../components/ScrollReveal';

const Home: React.FC = () => {
  return (
    <div className="bg-cream dark:bg-gray-900 transition-colors duration-300">
      <Hero />
      <ScrollReveal direction="up">
        <Features />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <MenuHighlights />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <Gallery />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <Catering />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <EventFlyers />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}>
        <Newsletter />
      </ScrollReveal>
    </div>
  );
};

export default Home;