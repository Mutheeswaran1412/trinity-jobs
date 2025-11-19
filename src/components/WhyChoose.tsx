import React from 'react';

interface WhyChooseProps {
  onNavigate?: (page: string) => void;
}

const WhyChoose: React.FC<WhyChooseProps> = ({ onNavigate }) => {
  const stats = [
    {
      number: "30+",
      label: "Happy Clients",
      image: "https://images.pexels.com/photos/3184300/pexels-photo-3184300.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "15+",
      label: "Year Growth Partner",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "35+",
      label: "Happy Clients",
      image: "https://images.pexels.com/photos/3182743/pexels-photo-3182743.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "18+",
      label: "Year Growth Partner",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{backgroundColor: '#EAF1FA'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            Why Choose Us
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Us
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Our mission is to drive progress and enhance the lives of our customers by delivering superior products and services that exceed.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative group overflow-hidden rounded-3xl h-80 hover:scale-105 transition-transform duration-300"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${stat.image})` }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium">
                  {stat.label}
                </div>
              </div>
              
              {/* Pink Icon */}
              <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;