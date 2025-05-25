"use client";
import React from 'react';
import { useEffect } from 'react';
import { Users, Target, Eye,BadgeInfo, Award, CheckCircle, Shield, Globe, Zap } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "500+", label: "Complaints Resolved" },
    { number: "50k+", label: "Active Users" },
    { number: "90%", label: "Faster Response" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  const departments = [
    "Infrastructure", "Education", "Revenue", "Health", "Water Supply & Sanitation",
    "Electricity & Power", "Transportation", "Municipal Services", "Police Services",
    "Environment", "Housing & Urban Development", "Social Welfare", "Public Grievances"
  ];

  return (
    <div className="min-h-scree px-4 py-20">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <BadgeInfo className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
           Empowering citizens to voice their concerns and transform communities through seamless governance interaction
        </p>
      </div>
      {/* Mission & Vision */}
<section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8  text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To bridge the gap between citizens and government authorities by providing a transparent, 
                efficient, and accessible platform for complaint management. We empower every voice to be 
                heard and every issue to find resolution through technology-driven governance solutions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8  text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To create a future where every citizen actively participates in governance, where transparency 
                is the norm, and where technology serves as the catalyst for building cleaner, safer, and 
                more responsive communities across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-black dark:text-white font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <br></br>
      <br></br>
      {/* How It Works */}
           <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How SwarajDesk Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Submit Complaint</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Report issues like waste dumping, potholes, or service problems with photos and location details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your complaint through three stages: Registered, Under Processing, and Completed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Get Resolution</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive updates and see your issue resolved through our transparent escalation system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments We Cover */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-12">
            Departments We Cover
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white dark:bg-black p-4 rounded-xl border-2 border-black dark:border-white hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white font-medium text-sm">
                    {dept}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;