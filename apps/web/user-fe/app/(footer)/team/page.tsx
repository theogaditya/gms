"use client";
import React from 'react';
import { useEffect } from 'react';
import { Github, Linkedin, Users, Heart, Code, Target, Eye,Handshake } from 'lucide-react';

const TeamPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      name: "Aditya Hota",
      role: "Full stack and devops engineer & Co-founder",
      image: "https://swarajdesk.adityahota.online/adi-pfp.jpg",
      github: "https://github.com/theogaditya",
      linkedin: "https://www.linkedin.com/in/aditya-hota-6b1167276/",
    },
    {
      name: "Abhash Bahara",
      role: "Full stack and devops engineer & Co-founder",
      image: "https://swarajdesk.adityahota.online/abhash-pfp.jpg",
      github: "https://github.com/MistaHolmes",
      linkedin: "https://www.linkedin.com/in/abhash-behera-70b77528b/",
    },
    {
      name: "Pramit kumar ",
      role: "Full stack engineer & Co-founder",
      image: "https://swarajdesk.adityahota.online/pramit-pfp.png",
      github: "https://github.com/PRAMITKN",
      linkedin: "https://www.linkedin.com/in/pramitkumarnaik/",
    },
  ];

  const values = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Citizen First",
      description: "Every decision we make prioritizes the needs and experiences of the citizens we serve."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Transparency",
      description: "Open processes, clear communication, and accountable governance at every step."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Empathy",
      description: "Understanding the real challenges citizens face and building solutions with compassion."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to solve age-old governance challenges."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black ">
      {/* Hero Section */}
      <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <Handshake className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Meet Our Team</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
           Passionate individuals working together to transform how citizens interact with governance
        </p>
      </div>
      </section>

      {/* Mission & Vision - Team Style */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Purpose</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We exist to bridge the gap between citizens and governance. Every team member brings unique expertise 
                to create technology that truly serves the people and strengthens democratic participation.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8  text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Commitment</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Building transparent, efficient, and accessible governance solutions. We're committed to ensuring 
                every voice is heard and every issue finds resolution through thoughtful technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300">
                <div className="text-gray-600 dark:text-gray-400 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Core Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-600 grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                    {member.role}
                  </p>

                  <div className="flex justify-center gap-3">
                    {member.github && (
                      <a href={member.github} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* How We Work */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How We Work Together
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Collaborative Design</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We design every feature together, ensuring diverse perspectives shape solutions that truly serve citizens.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agile Development</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Rapid iteration and continuous feedback help us build better solutions faster while maintaining quality.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community Impact</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every team decision is evaluated through the lens of real community impact and citizen empowerment.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default TeamPage;