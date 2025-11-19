import React, { useRef, useState } from 'react';
import { TrendingUp, DollarSign, MapPin, ArrowRight } from 'lucide-react';

interface SalaryReportProps {
  onNavigate?: (page: string) => void;
}

const SalaryReport: React.FC<SalaryReportProps> = ({ onNavigate }) => {
  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-orange-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                2025 Edition
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              The Tech Salary Report Is Out Now!
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Explore key salary trends broken down by job role, in-demand skills, and location—your essential guide to earning your worth in 2025.
            </p>
            
            <button 
              onClick={() => onNavigate && onNavigate('salary-report')}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Read the report</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <InteractiveCard />
        </div>
      </div>
    </section>
  );
};

const InteractiveCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  };

  return (
    <div 
      className="relative p-8" 
      style={{ perspective: '1000px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl shadow-2xl p-8 text-gray-900 transition-all duration-200 ease-out cursor-pointer ${
          isHovered ? 'shadow-3xl' : ''
        }`}
        style={{ transform, transformStyle: 'preserve-3d' }}
      >
        <h3 
          className={`text-2xl font-bold mb-6 text-center transition-colors duration-200 ${
            isHovered ? 'text-blue-600' : ''
          }`}
          style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)' }}
        >
          Average Tech Salaries
        </h3>
        <div className="space-y-4">
          <div 
            className={`flex justify-between items-center p-4 rounded-lg transition-colors duration-200 ${
              isHovered ? 'bg-green-50' : 'bg-gray-50'
            }`}
            style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-600" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0px)' }} />
              <span className="font-medium">AI Engineer</span>
            </div>
            <span className="text-xl font-bold text-green-600" style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)' }}>$165k</span>
          </div>
          <div 
            className={`flex justify-between items-center p-4 rounded-lg transition-colors duration-200 ${
              isHovered ? 'bg-blue-50' : 'bg-gray-50'
            }`}
            style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-blue-600" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0px)' }} />
              <span className="font-medium">Full Stack Developer</span>
            </div>
            <span className="text-xl font-bold text-blue-600" style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)' }}>$125k</span>
          </div>
          <div 
            className={`flex justify-between items-center p-4 rounded-lg transition-colors duration-200 ${
              isHovered ? 'bg-purple-50' : 'bg-gray-50'
            }`}
            style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-600" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0px)' }} />
              <span className="font-medium">DevOps Engineer</span>
            </div>
            <span className="text-xl font-bold text-purple-600" style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)' }}>$140k</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryReport;