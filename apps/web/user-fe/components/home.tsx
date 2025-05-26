'use client';

import { useEffect } from 'react';
import ScrollExpandMedia from '@/components/blocks/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

// https://i.ibb.co/GSMY3Y9/unnamed.png
const sampleMediaContent: MediaContent = {
  src: 'https://swarajdesk.adityahota.online/landing-expland.png',
  background:
    'https://swarajdesk.adityahota.online/landing-hero-img.jpeg',
  title: 'SwarajDesk',
  date: '.',
  scrollToExpand: 'Scroll',
  about: {
    overview:
      'Empower your voice in governance with SwarajDesk - a seamless platform bridging citizens and authorities. Report issues like waste dumping or potholes effortlessly, track real-time progress across departments, and engage with your community through upvotes',
    conclusion:
      ' Leverage AI-driven categorization for faster resolutions, multilingual support for accessibility, and transparent audit trails. Transform complaints into actionable solutions, fostering cleaner, safer neighborhoods together.',
  },
};

const MediaContentSection = () => {
  return (
    <div className='max-w-4xl mx-auto'>

      <p className='text-lg mb-8 text-black dark:text-white'>
        {sampleMediaContent.about.overview}
      </p>

      <p className='text-lg mb-8 text-black dark:text-white'>
        {sampleMediaContent.about.conclusion}
      </p>
    </div>
  );
};

export const ImageExpansionTextBlend = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaSrc={sampleMediaContent.src}
        bgImageSrc={sampleMediaContent.background}
        title={sampleMediaContent.title}
        date={sampleMediaContent.date}
        scrollToExpand={sampleMediaContent.scrollToExpand}
        textBlend
      >
        <MediaContentSection />
      </ScrollExpandMedia>
    </div>
  );
};

export const ImageExpansion = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaSrc={sampleMediaContent.src}
        bgImageSrc={sampleMediaContent.background}
        title={sampleMediaContent.title}
        date={sampleMediaContent.date}
        scrollToExpand={sampleMediaContent.scrollToExpand}
      >
        <MediaContentSection />
      </ScrollExpandMedia>
    </div>
  );
};

const Demo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaSrc={sampleMediaContent.src}
        bgImageSrc={sampleMediaContent.background}
        title={sampleMediaContent.title}
        date={sampleMediaContent.date}
        scrollToExpand={sampleMediaContent.scrollToExpand}
      >
        <MediaContentSection />
      </ScrollExpandMedia>
    </div>
  );
};

export default Demo;