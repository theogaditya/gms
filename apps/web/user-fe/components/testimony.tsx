"use client";

import { AnimatedTestimonials } from "@/components/blocks/animated-testimonials"

export function AnimatedTestimonialsBasic() {
  return (
    <AnimatedTestimonials
      testimonials={[
        {
          id: 1,
          name: "Alex Johnson",
          role: "Full Stack Developer",
          company: "TechFlow",
          content:
            "This starter template saved me weeks of setup time. The Supabase integration is flawless, and the UI components are beautiful and easy to customize. Worth every penny!",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
          id: 2,
          name: "Sarah Miller",
          role: "Frontend Engineer",
          company: "DesignHub",
          content:
            "I've used many starter templates, but this one stands out for its clean architecture and attention to detail. The TypeScript support is excellent, and the documentation is comprehensive.",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        {
          id: 3,
          name: "Michael Chen",
          role: "Product Manager",
          company: "InnovateLabs",
          content:
            "Our team was able to launch our MVP in record time thanks to this template. The authentication flow and user management features worked right out of the box. Highly recommended!",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/46.jpg",
        },
      ]}
      trustedCompanies={["Google", "Microsoft", "Airbnb", "Spotify", "Netflix"]}
    />
  );
}


