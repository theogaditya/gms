"use client";

import { AnimatedTestimonials } from "@/components/blocks/animated-testimonials";

const testimonialsData = {
  en: [
    {
      id: 1,
      name: "Sunita Sharma",
      role: "Resident",
      company: "Municipal Corporation",
      content:
        "This platform made it so easy to report the broken streetlights near my home. The issue was resolved quickly, and I was kept informed throughout the process.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    {
      id: 2,
      name: "Rakesh Kumar",
      role: "Shop Owner",
      company: "Revenue Department",
      content:
        "I filed a complaint about incorrect property tax charges, and the support team helped me sort it out efficiently. Great service for citizens!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    },
    {
      id: 3,
      name: "Meena Patel",
      role: "Community Leader",
      company: "Environment Department",
      content:
        "Reporting the illegal dumping site was straightforward, and the cleanup happened faster than expected. This system empowers communities.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 4,
      name: "Amit Joshi",
      role: "Resident",
      company: "City Council",
      content:
        "The complaint submission process is very user-friendly. I appreciate how quickly the team responded to my request regarding water supply issues.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
      id: 5,
      name: "Priya Singh",
      role: "Shop Owner",
      company: "Local Business Association",
      content:
        "Excellent service! The team helped me resolve an issue with illegal construction near my shop. The entire process was smooth and transparent.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    },
    {
      id: 6,
      name: "Rajiv Mehta",
      role: "Community Volunteer",
      company: "Neighborhood Watch",
      content:
        "This platform has made it easier for us to report environmental concerns. It truly strengthens community involvement and accountability.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/men/59.jpg",
    },
  ],
};

// Trusted by common people/community
const trustedCommunity = [
  "Local Neighborhood Groups",
  "Small Business Owners",
  "Community Volunteers",
  "Everyday Citizens",
  "Neighborhood Associations",
];

export function AnimatedTestimonialsBasic() {
  // Remove avatar from testimonials before passing
  const testimonialsWithoutAvatar = testimonialsData.en.map(({ avatar, ...rest }) => rest);

  return (
    <AnimatedTestimonials
      testimonials={[
        {
          id: 1,
          name: "Rajesh Kumar",
          role: "Ward Member",
          panchayat: "Shivpur Panchayat",
          content:
            "Earlier, tracking complaints was a manual hassle. This system has made everything digital, transparent, and fast. Citizens are finally seeing real-time updates on their issues.",
          rating: 5,
          avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0D8ABC&color=fff",
        },
        {
          id: 2,
          name: "Meena Kumari",
          role: "Citizen",
          panchayat: "Lakshmi Nagar Panchayat",
          content:
            "I submitted a sanitation complaint and got updates at every step. It was resolved in just a few days. This system makes us feel like our voices matter.",
          rating: 5,
          avatar: "https://ui-avatars.com/api/?name=Meena+Kumari&background=F39C12&color=fff",
        },
        {
          id: 3,
          name: "Amit Sharma",
          role: "Sarpanch",
          panchayat: "Rajgarh Panchayat",
          content:
            "With this system, we’ve built more trust in our governance. People feel heard and respected, and the monthly surveys are a big hit among villagers.",
          rating: 5,
          avatar: "https://ui-avatars.com/api/?name=Amit+Sharma&background=27AE60&color=fff",
        }
      ]}
    />
  );
}
