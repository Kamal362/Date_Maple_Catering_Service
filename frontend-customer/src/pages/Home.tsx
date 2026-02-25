import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import MenuHighlights from '../components/MenuHighlights';
import Catering from '../components/Catering';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Gallery from '../components/Gallery';
import EventFlyers from '../components/EventFlyers';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <Features />
      <MenuHighlights />
      <Gallery />
      <Catering />
      <EventFlyers />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Home;