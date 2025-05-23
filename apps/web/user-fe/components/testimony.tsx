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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedTestimonials
        testimonials={testimonialsWithoutAvatar}
        trustedCompanies={trustedCommunity}
      />
    </div>
  );
}
