import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface NewHeroProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
}

const NewHero: React.FC<NewHeroProps> = ({ onNavigate, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('job-listings', { searchTerm, location });
    }
  };

  return (
    <>
      {/* Main Banner Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-200 rounded-full opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h5 className="text-blue-600 font-semibold text-lg">
                  We Have 208,000+ Live Jobs
                </h5>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your <span className="text-blue-600">Dream</span> Job Is Waiting For You
                </h1>
                <h6 className="text-lg text-gray-600 leading-relaxed">
                  Type your keyword, then click search to find your perfect job.
                </h6>
              </div>

              {/* Search Form */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border">
                <form onSubmit={handleSearch}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-blue-600" />
                          </div>
                          <input
                            type="text"
                            placeholder="Job Title, Keywords"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <input
                            type="text"
                            placeholder="City Or Postcode"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Find Job
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Resume Builder CTA */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate && onNavigate('resume-templates')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  📄 Build Your Resume
                </button>
                <span className="text-gray-600">Create a professional resume in minutes</span>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-gray-900">Popular Searches:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Designer', 'Senior', 'Architecture', 'iOS', 'React', 'Python'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchTerm(term);
                        if (onNavigate) {
                          onNavigate('job-listings', { searchTerm: term, location });
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              {/* Dotted Circle Background */}
              <div className="absolute inset-0 flex items-center justify-center -mt-8">
                <div className="w-[26rem] h-[26rem] border-2 border-dashed border-gray-800 rounded-full opacity-50 animate-spin" style={{animationDuration: '20s'}}></div>
                <div className="w-[38rem] h-[38rem] border-2 border-dashed border-gray-800 rounded-full opacity-40 absolute animate-spin" style={{animationDuration: '30s', animationDirection: 'reverse'}}></div>
              </div>
              
              <img
                src="/images/women.png"
                alt="Professional woman"
                className="w-[30rem] h-[36rem] mx-auto object-contain relative z-10"
              />
              

            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <span className="text-2xl font-bold text-gray-400">Google</span>
            <span className="text-2xl font-bold text-gray-400">Microsoft</span>
            <span className="text-2xl font-bold text-gray-400">Amazon</span>
            <span className="text-2xl font-bold text-gray-400">Meta</span>
            <span className="text-2xl font-bold text-gray-400">Apple</span>
            <span className="text-2xl font-bold text-gray-400">Netflix</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h6 className="text-blue-600 font-semibold text-lg mb-2">How It Work</h6>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Follow Easy 4 Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              It is a long established fact that a reader will be distracted by the 
              readable content of a page when looking at its layout.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🔍",
                title: "Search Jobs",
                description: "The standard chunk of used below of those interested."
              },
              {
                icon: "📄",
                title: "CV/Resume",
                description: "The standard chunk of used below of those interested."
              },
              {
                icon: "👤",
                title: "Create Account",
                description: "The standard chunk of used below of those interested."
              },
              {
                icon: "✅",
                title: "Apply Them",
                description: "The standard chunk of used below of those interested."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewHero;