"use client";
import Demo from "@/components/home";
import { useEffect } from "react";
import { useState, useRef } from "react";
import {AnimatedTestimonialsBasic} from "@/components/testimony";
import { Users, Shield, Globe, Zap } from 'lucide-react';
import { Cta } from "@/components/ui/cta";

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Transparent",
      description: "End-to-end encryption with comprehensive audit logging ensures complete transparency in complaint resolution."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multilingual Support",
      description: "Access the platform in your preferred language with support for multiple regional languages."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Categorization",
      description: "Advanced AI automatically categorizes and standardizes complaints for faster processing and resolution."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Engagement",
      description: "Upvote public complaints and engage with your community to prioritize issues that matter most."
    }
  ];


const Statistics = () => {
  const [complaints, setComplaints] = useState(0);
  const [users, setUsers] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateNumber(500, setComplaints, 1500);
          animateNumber(50, setUsers, 1500);
          animateNumber(90, setResponseTime, 1500);
          animateNumber(98, setSatisfaction, 1500);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateNumber = (target: number, setter: React.Dispatch<React.SetStateAction<number>>, duration: number) => {
    let start = 0;
    const increment = target / (duration / 10);
        
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.ceil(start));
      }
    }, 10);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div 
        ref={statsRef} 
        
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-12">
            Our Impact
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            See how we're making a difference
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <StatCard 
            title="Complaints Resolved"
            value={complaints}
            suffix="+"
          />
          <StatCard
            title="Active Users"
            value={users}
            suffix="k+"
          />
          <StatCard
            title="Faster Response"
            value={responseTime}
            suffix="%"
          />
          <StatCard
            title="Satisfaction"
            value={satisfaction}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, suffix }: {
  title: string;
  value: number;
  suffix: string;
}) => (
  <div className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
      {value}
      <span className="text-xl">{suffix}</span>
    </div>
    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</div>
  </div>
);

export default function Home() {
  return (
      <div>
      <div id="home">
        <Demo />
      </div>
      <Statistics />
      <br></br>
      <br></br>
      <br></br>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-12">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-black p-8 rounded-2xl  dark:border-white hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-black dark:text-white mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-black dark:text-white leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div>
      </div>
      <br></br>
      <Cta />
      <AnimatedTestimonialsBasic />
    </div>
  );
}