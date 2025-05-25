"use client";
import React, { useEffect } from "react";
import { Code,CheckCircle,Github, GitBranch, GitPullRequest, Users, Terminal, BookOpen, Globe } from "lucide-react";

const ContributePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contributionAreas = [
    { title: "Backend Development", desc: "Help improve our core grievance management system and API integrations" },
    { title: "UI/UX Improvements", desc: "Enhance citizen interface and accessibility features" },
    { title: "Documentation", desc: "Help us improve developer and user documentation" },
    { title: "Testing & QA", desc: "Contribute to automated testing and quality assurance" },
    { title: "Localization", desc: "Help translate the platform into regional languages" },
    { title: "Community Support", desc: "Assist users and triage GitHub issues" },
  ];

  const benefits = [
    "Gain real-world open source experience",
    "Receive mentorship from core maintainers",
    "Get featured in our contributor hall of fame",
    "Eligible for swag and recognition",
    "Improve your public portfolio",
    "Impact governance for millions",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <GitBranch className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contribute to GMS</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
          Join our open source community building transparent governance solutions. Whether you're a developer, designer, or documentation writer, your contributions matter.
        </p>
      </div>

      {/* Why Contribute */}
      <section className="max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Why Contribute</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <Users className="w-10 h-10 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Community Impact</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your code directly improves governance transparency for millions of citizens across India.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <Terminal className="w-10 h-10 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Skill Development</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Work on real-world problems using modern tech stack with expert guidance.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transform transition-all duration-300 cursor-pointer text-center">
            <Globe className="w-10 h-10 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Open Source Values</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Be part of a community that believes in transparency, collaboration, and public good.
            </p>
          </div>
        </div>
      </section>

      {/* Contribution Process */}
      <section className="max-w-5xl mx-auto mb-20 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">How to Contribute</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          <li><strong>Fork the repository</strong> on GitHub</li>
          <li><strong>Clone your fork</strong> and create a new branch</li>
          <li><strong>Make your changes</strong> following coding guidelines</li>
          <li><strong>Test your changes</strong> and update documentation</li>
          <li><strong>Submit a Pull Request</strong> with clear description</li>
        </ol>
      </section>

      {/* Contribution Guidelines */}
      <section className="max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Contribution Guidelines</h2>
        <ul className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-300 cursor-pointer">
              <CheckCircle className="w-6 h-6 text-gray-600" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* GitHub CTA */}
      <section className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Get Started Now</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Ready to make your first contribution? Start with these resources:
        </p>
        <div className="flex flex-col space-y-4 items-center">
          <a 
            href="https://github.com/theogaditya/gms" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            View Repository
          </a>
          <a 
            href="https://github.com/theogaditya/gms/issues"
            className="text-green-600 hover:underline"
          >GitHub
            Explore Good First Issues →
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContributePage;