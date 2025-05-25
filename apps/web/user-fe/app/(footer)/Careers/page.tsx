"use client";
import React, { useEffect } from "react";
import { Briefcase, Users, MapPin, CheckCircle, UserPlus, Smile, Globe } from "lucide-react";

const CareerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const roles = [
    { title: "Software Engineer", desc: "Design, develop, and maintain our complaint management platform ensuring security and scalability." },
    { title: "Data Analyst", desc: "Analyze user data to improve services and identify community needs." },
    { title: "Customer Support Executive", desc: "Assist citizens with queries and provide timely resolutions." },
    { title: "UI/UX Designer", desc: "Create intuitive interfaces ensuring accessibility for all users." },
    { title: "DevOps Engineer", desc: "Manage deployment pipelines, cloud infrastructure, and maintain uptime." },
    { title: "Community Outreach Specialist", desc: "Build relationships with local governments and citizen groups to expand platform reach." },
  ];

  const benefits = [
    "Competitive salary and performance bonuses",
    "Flexible working hours and remote work options",
    "Health insurance and wellness programs",
    "Continuous learning and career development opportunities",
    "Inclusive and diverse workplace culture",
    "Opportunity to impact millions of citizens",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Careers at SwarajDesk</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
          Join a passionate team dedicated to empowering citizens and transforming governance through technology. Build a meaningful career where your work truly impacts society.
        </p>
      </div>

      {/* Why Work With Us */}
      <section className="max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Why Work With Us</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                          hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <Users className="w-10 h-10 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Purpose-Driven</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Work on projects that directly improve transparency and quality of governance for millions of citizens.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                          hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <MapPin className="w-10 h-10 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Impact Across India</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Be part of a nationwide initiative to make governance more accessible, efficient, and citizen-friendly.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                          hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Growth Opportunities</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Learn from experts, attend training sessions, and grow your skills in an evolving tech and governance environment.
            </p>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Open Roles</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {roles.map(({ title, desc }, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                                    hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Process */}
      <section className="max-w-5xl mx-auto mb-20 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Application Process</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          <li><strong>Submit your resume and cover letter</strong> through our online portal or email.</li>
          <li><strong>Initial screening:</strong> Our HR team reviews your application and contacts you for a phone interview.</li>
          <li><strong>Technical assessment:</strong> Complete a coding or skills test relevant to the role.</li>
          <li><strong>Interview rounds:</strong> Meet with team leads and project managers to discuss your experience and fit.</li>
          <li><strong>Offer & onboarding:</strong> Successful candidates will receive an offer and onboarding guidance.</li>
        </ol>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Employee Benefits</h2>
        <ul className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
                                    hover:shadow-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-300 cursor-pointer">
              <Smile className="w-6 h-6 text-green-600" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Diversity & Inclusion */}
      <section className="max-w-5xl mx-auto mb-20 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Diversity & Inclusion</h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
          SwarajDesk is committed to building an inclusive environment where diversity is celebrated. We welcome applications from all backgrounds, including underrepresented communities, persons with disabilities, and veterans. We believe diverse perspectives foster innovation and stronger solutions for citizens.
        </p>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Interested in joining our team? Reach out for career inquiries and support.
        </p>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Email: <a href="mailto:careers@swarajdesk.in" className="text-green-600 hover:underline">careers@swarajdesk.in</a></p>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Phone: <a href="tel:+911234567890" className="text-green-600 hover:underline">+91 12345 67890</a></p>
      </section>
    </div>
  );
};

export default CareerPage;
