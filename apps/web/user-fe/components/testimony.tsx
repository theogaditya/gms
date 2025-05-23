"use client";

import { AnimatedTestimonials } from "@/components/blocks/animated-testimonials"

export function AnimatedTestimonialsBasic() {
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
            "With this system, we’ve built more trust in our governance. People feel heard and respected, and the automatic notifications are a big hit among villagers.",
          rating: 5,
          avatar: "https://ui-avatars.com/api/?name=Amit+Sharma&background=27AE60&color=fff",
        }
      ]}
    />
  );
}


