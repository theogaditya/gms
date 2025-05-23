// components/Footer7.tsx

"use client";
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "JanConnect",
    links: [
      { name: "Submit Complaint", href: "/submit" },
      { name: "Track Complaint", href: "/track" },
      { name: "Community Page", href: "/community" },
      { name: "Multilingual Support", href: "/language" },
    ],
  },
  {
    title: "Services",
    links: [
      { name: "Infrastructure", href: "/categories/infrastructure" },
      { name: "Environment", href: "/categories/environment" },
      { name: "Revenue", href: "/categories/revenue" },
      { name: "Social", href: "/categories/social" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help & FAQs", href: "/help" },
      { name: "Chatbot Guide", href: "/chatbot" },
      { name: "Audit Logs", href: "/audit" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

export const Footer7 = ({
  sections = defaultSections,
  description = "Empowering citizens to report, track, and resolve complaints in real-time. JanConnect connects people with the authorities through transparency and technology.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 JanConnect. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 px-4 py-16 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Description & Social */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              JanConnect
            </h2>
            <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
            <ul className="flex space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-blue-600 dark:hover:text-blue-400">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Sections */}
          <div className="grid gap-10 grid-cols-2 sm:grid-cols-3">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-12 border-t pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>{copyright}</p>
          <ul className="flex flex-col sm:flex-row sm:space-x-6 mt-2 sm:mt-0">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
