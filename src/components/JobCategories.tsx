import React from 'react';

interface JobCategoriesProps {
  onNavigate?: (page: string, data?: any) => void;
}

const JobCategories: React.FC<JobCategoriesProps> = ({ onNavigate }) => {
  const categories = [
    { name: "UI/UX Design", jobs: "100+ Posted New Jobs" },
    { name: "Illustration", jobs: "200+ Posted New Jobs" },
    { name: "Cool Art", jobs: "150+ Posted New Jobs" },
    { name: "Web Design", jobs: "100+ Posted New Jobs" },
    { name: "Product Design", jobs: "110+ Posted New Jobs" },
    { name: "Developer", jobs: "250+ Posted New Jobs" },
    { name: "Animation", jobs: "150+ Posted New Jobs" }
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h6 className="text-blue-600 font-semibold text-lg mb-2">Jobs Category</h6>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Desire Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            There are many variations of passages of available, but the majority have suffered
            some form, by injected humour, or look even slightly believable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => onNavigate && onNavigate('job-listings', { category: category.name })}
              className="bg-gray-50 hover:bg-blue-50 p-6 rounded-xl cursor-pointer transition-colors group"
            >
              <div className="text-center">
                <h5 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {category.name}
                </h5>
                <span className="text-gray-600 text-sm">{category.jobs}</span>
              </div>
            </div>
          ))}
          
          <div 
            onClick={() => onNavigate && onNavigate('job-listings')}
            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-xl cursor-pointer transition-colors text-center text-white"
          >
            <span className="font-semibold">100+ More<br />Category</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCategories;