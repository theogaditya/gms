"use client";
import Image from "next/image";
import Demo from "@/components/home";
import { useEffect } from "react";
import { useState, useRef } from "react";
import {AnimatedTestimonialsBasic} from "@/components/testimony";
import { Footer7 } from "@/components/ui/footer-7";

// Add this to home.tsx
// Add to home.tsx
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
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
      <Demo />
      <Statistics />
      <AnimatedTestimonialsBasic />
      <Footer7 />
    </div>
  );
}