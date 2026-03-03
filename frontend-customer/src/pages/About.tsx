import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';
import { useTheme } from '../context/ThemeContext';

// Fallback static team members used if no content saved by admin yet
const FALLBACK_TEAM = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & Head Chef',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    description: 'With over 15 years of culinary experience, Sarah brings her passion for innovative flavors to every creation.',
  },
  {
    name: 'Michael Chen',
    role: 'Operations Manager',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    description: 'Michael ensures seamless operations and exceptional service for all our catering events.',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Pastry Chef',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    description: "Emma's artistic touch and precision make our pastries and desserts truly special.",
  },
];

const FALLBACK_VALUES = [
  {
    title: 'Quality',
    description: 'We never compromise on quality, sourcing the finest ingredients and maintaining rigorous standards in everything we create.',
    icon: null,
  },
  {
    title: 'Passion',
    description: 'Our team approaches every dish and beverage with genuine enthusiasm and creative flair, ensuring each creation is made with love.',
    icon: null,
  },
  {
    title: 'Community',
    description: 'We believe in fostering connections and bringing people together through shared meals and memorable experiences.',
    icon: null,
  },
];

const VALUE_ICONS = [
  // Quality
  <svg key="quality" className="w-8 h-8 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
  </svg>,
  // Passion
  <svg key="passion" className="w-8 h-8 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
  </svg>,
  // Community
  <svg key="community" className="w-8 h-8 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>,
];

const avatarColors = [
  'bg-primary-tea', 'bg-accent-tea', 'bg-secondary-tea',
  'bg-yellow-500', 'bg-emerald-500', 'bg-sky-500',
];

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const About: React.FC = () => {
  const { theme } = useTheme();
  const [teamContent, setTeamContent] = useState<HomePageContent | null>(null);
  const [storyContent, setStoryContent] = useState<HomePageContent | null>(null);
  const [valuesContent, setValuesContent] = useState<HomePageContent | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    // Fetch all three about-page sections in parallel
    Promise.allSettled([
      getHomePageContentBySection('team'),
      getHomePageContentBySection('aboutStory'),
      getHomePageContentBySection('aboutValues'),
    ]).then(([teamRes, storyRes, valuesRes]) => {
      if (teamRes.status === 'fulfilled') setTeamContent(teamRes.value);
      if (storyRes.status === 'fulfilled') setStoryContent(storyRes.value);
      if (valuesRes.status === 'fulfilled') setValuesContent(valuesRes.value);
      setTeamLoading(false);
    });
  }, []);

  // Build team member list — use admin data if available, else fallback
  const teamMembers =
    teamContent?.items && teamContent.items.length > 0
      ? teamContent.items
      : FALLBACK_TEAM;

  const teamTitle = teamContent?.title || 'Meet Our Team';
  const teamSubtitle = teamContent?.subtitle || '';

  // Story section data
  const pageTitle = storyContent?.title || 'Our Story';
  const pageTagline = storyContent?.subtitle || 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam aliquyam erat, sed diam voluptua. At vero.';
  const aboutHeading = storyContent?.buttonText || 'About Coffee Shop';
  const sideImage = storyContent?.buttonLink || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
  const aboutParagraph1 = storyContent?.description || 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.';
  const aboutParagraph2 = (storyContent?.settings?.paragraph2 as string) || 'Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.';
  const coffeeServed = (storyContent?.settings?.coffeeServed as string) || '36546';
  const coffeeTypes = (storyContent?.settings?.coffeeTypes as string) || '28';
  const extraStatValue = (storyContent?.settings?.extraStatValue as string) || '';
  const extraStatLabel = (storyContent?.settings?.extraStatLabel as string) || '';

  // Values section data
  const valuesTitle = valuesContent?.title || 'Our Values';
  const valueItems =
    valuesContent?.items && valuesContent.items.length > 0
      ? valuesContent.items
      : FALLBACK_VALUES;

  // Theme classes
  const pageBg = theme === 'dark' ? 'bg-gray-900' : 'bg-cream';
  const headingColor = theme === 'dark' ? 'text-amber-400' : 'text-primary-tea';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-dark-tea';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-secondary-tea';
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-light-tea';

  // Statistics — always include Coffee Served and Types of Coffees; add extra stat if set
  const stats = [
    { value: coffeeServed, label: 'Coffee Served' },
    { value: coffeeTypes, label: 'Type of Coffees' },
    { value: String(teamMembers.length), label: 'Team Members' },
    ...(extraStatValue ? [{ value: extraStatValue, label: extraStatLabel || 'Extra Stat' }] : []),
  ];

  return (
    <div className={`section-padding ${pageBg} min-h-screen`}>
      <div className="container mx-auto px-4">
        {/* Hero header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-heading font-bold mb-4 ${headingColor}`}>{pageTitle}</h1>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className={`text-xl max-w-3xl mx-auto ${textColor}`}>{pageTagline}</p>
        </div>

        {/* About + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className={`text-3xl font-heading font-bold mb-6 ${headingColor}`}>{aboutHeading}</h2>
            <p className={`${textColor} mb-6`}>{aboutParagraph1}</p>
            <p className={`${textColor} mb-6`}>{aboutParagraph2}</p>
            <div className={`grid grid-cols-${Math.min(stats.length, 3)} gap-4 mt-8`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className={`text-2xl md:text-3xl font-heading font-bold ${headingColor}`}>{stat.value}</h3>
                  <p className={textColor}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={sideImage}
              alt="Date&Maple Café"
              className="w-full h-auto object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'; }}
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className={`text-3xl font-heading font-bold mb-12 text-center ${headingColor}`}>{valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueItems.map((value, index) => (
              <div key={index} className={`${cardBg} border rounded-xl text-center p-8 shadow-sm`}>
                <div className="w-16 h-16 bg-primary-tea bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  {value.icon ? (
                    <span className="text-3xl">{value.icon}</span>
                  ) : (
                    VALUE_ICONS[index % VALUE_ICONS.length]
                  )}
                </div>
                <h3 className={`text-2xl font-heading font-semibold mb-4 ${headingColor}`}>{value.title}</h3>
                <p className={textColor}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meet Our Team */}
        <div className={`${cardBg} border rounded-2xl p-8 shadow-sm`}>
          <div className="text-center mb-10">
            <h2 className={`text-3xl font-heading font-bold mb-3 ${headingColor}`}>{teamTitle}</h2>
            <div className="w-16 h-1 bg-accent-tea mx-auto"></div>
            {teamSubtitle && (
              <p className={`mt-4 text-base ${mutedColor} max-w-xl mx-auto`}>{teamSubtitle}</p>
            )}
          </div>

          {teamLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-secondary-tea mx-auto mb-4" />
                  <div className="h-5 bg-secondary-tea rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-secondary-tea rounded w-1/2 mx-auto mb-3" />
                  <div className="h-3 bg-secondary-tea rounded w-full" />
                  <div className="h-3 bg-secondary-tea rounded w-5/6 mx-auto mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${
              teamMembers.length === 1 ? 'max-w-xs mx-auto' :
              teamMembers.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
              'md:grid-cols-3'
            } gap-8`}>
              {teamMembers.map((member, index) => {
                const name = member.name || 'Team Member';
                const colorClass = avatarColors[index % avatarColors.length];
                return (
                  <div key={index} className="text-center group">
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-light-tea shadow-md group-hover:shadow-lg transition-shadow">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.initials-fallback')) {
                              const div = document.createElement('div');
                              div.className = `initials-fallback w-full h-full flex items-center justify-center ${colorClass} text-white text-3xl font-bold`;
                              div.textContent = getInitials(name);
                              parent.appendChild(div);
                            }
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${colorClass} text-white text-3xl font-bold`}>
                          {getInitials(name)}
                        </div>
                      )}
                    </div>
                    <h3 className={`text-xl font-heading font-semibold mb-1 ${headingColor}`}>{name}</h3>
                    {member.role && (
                      <p className="text-accent-tea font-medium mb-2">{member.role}</p>
                    )}
                    {member.description && (
                      <p className={`text-sm leading-relaxed ${textColor}`}>{member.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;