import React, { useState, useEffect } from 'react';
import { Building, Briefcase, Users } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(end * progress));
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Stats = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Why ZyncJobs Works for You
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Trusted by millions of tech professionals and thousands of companies worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={5} suffix="k+" />
            </div>
            <div className="text-lg text-gray-400 font-medium">
              companies hire on ZyncJobs
            </div>
          </div>
          
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={200} suffix="k+" />
            </div>
            <div className="text-lg text-gray-400 font-medium">
              jobs posted monthly
            </div>
          </div>
          
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              <AnimatedCounter end={7} suffix="M+" />
            </div>
            <div className="text-lg text-gray-400 font-medium">
              tech professionals trust ZyncJobs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;