"use client";
import React, { useEffect } from "react";
import { Shield, Lock, FileText, UserCheck, Globe, AlertCircle } from "lucide-react";

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <Shield className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information in compliance with Indian government regulations.
        </p>
      </div>

      {/* Sections */}
      <section className="max-w-5xl mx-auto space-y-12 text-gray-800 dark:text-gray-300">

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
          </div>
          <p>
            We collect necessary personal data such as your name, contact details, complaint information, and usage data. This is done in compliance with the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> by the Indian government.
          </p>
          <p className="mt-2">
            We ensure that sensitive personal data, including government-issued IDs or financial details, are only collected with explicit consent and handled with strict confidentiality.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
          </div>
          <p>
            Your data is used solely for managing complaints, communication, and improving service delivery. We comply with the <strong>Personal Data Protection Bill (yet to be enacted)</strong> principles of transparency and user control.
          </p>
          <p className="mt-2">
            We never sell or share personal information with third parties except under legal obligations or with your explicit consent.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Cookies & Tracking</h2>
          </div>
          <p>
            We use cookies and similar tracking technologies to enhance user experience and analyze traffic. This complies with global and Indian guidelines encouraging transparency in cookie usage.
          </p>
          <p className="mt-2">
            You can disable cookies through your browser settings, but this might affect some features.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Retention</h2>
          </div>
          <p>
            We retain personal data only as long as necessary for the purpose it was collected, in accordance with Indian laws and regulatory requirements.
          </p>
          <p className="mt-2">
            Once data is no longer required, it is securely deleted or anonymized.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Rights</h2>
          </div>
          <p>
            You have the right to access, correct, and request deletion of your personal data. This is aligned with the principles outlined by the <strong>Right to Information Act, 2005</strong> and upcoming data protection legislation.
          </p>
          <p className="mt-2">
            Contact us anytime for privacy-related requests or concerns. We will respond within the timeframes mandated by law.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Security Measures</h2>
          </div>
          <p>
            We implement reasonable security practices as required under Indian IT rules, including encryption, secure servers, and regular audits, to safeguard your personal information.
          </p>
          <p className="mt-2">
            Despite our efforts, no data transmission over the internet can be guaranteed as 100% secure.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                        hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Changes to this Policy</h2>
          </div>
          <p>
            We may update this privacy policy from time to time to comply with legal changes or improve transparency. We encourage you to review this page periodically.
          </p>
          <p className="mt-2">
            Continued use of the platform after updates implies acceptance of the updated policy.
          </p>
        </div>

      </section>
    </div>
  );
};

export default PrivacyPage;
