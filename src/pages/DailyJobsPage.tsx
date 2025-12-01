import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Briefcase, DollarSign, Clock, Search } from 'lucide-react';

interface DailyJobsPageProps {
  onNavigate: (page: string) => void;
}

const DailyJobsPage: React.FC<DailyJobsPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const todaysJobs = [
    {
      id: 1,
      title: "Senior AI Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$150k - $200k",
      posted: "2 hours ago",
      skills: ["Python", "TensorFlow", "Machine Learning", "AI"],
      description: "Join our AI team to build cutting-edge machine learning solutions for enterprise clients.",
      isNew: true
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $160k",
      posted: "4 hours ago",
      skills: ["React", "TypeScript", "Node.js"],
      description: "Build modern web applications using React and TypeScript in a fast-paced startup environment.",
      isNew: true
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$130k - $170k",
      posted: "6 hours ago",
      skills: ["AWS", "Kubernetes", "Docker", "CI/CD"],
      description: "Manage cloud infrastructure and implement DevOps best practices for scalable applications.",
      isNew: false
    },
    {
      id: 4,
      title: "Data Scientist",
      company: "DataFlow Solutions",
      location: "New York, NY",
      type: "Full-time",
      salary: "$140k - $180k",
      posted: "8 hours ago",
      skills: ["Python", "SQL", "Machine Learning", "Analytics"],
      description: "Analyze complex datasets and build predictive models to drive business insights.",
      isNew: false
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Filter jobs based on search criteria
  useEffect(() => {
    const filtered = todaysJobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = !location || 
        job.location.toLowerCase().includes(location.toLowerCase());
      
      return matchesSearch && matchesLocation;
    });
    setFilteredJobs(filtered);
  }, [searchTerm, location]);

  useEffect(() => {
    setFilteredJobs(todaysJobs);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => onNavigate && onNavigate('home')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Daily Highlights
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Today's Job Highlights
            </h1>
            <p className="text-lg text-gray-600">
              Fresh opportunities posted on {currentDate}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title or keyword (e.g., Senior AI Engineer)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location (e.g., San Francisco, CA)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredJobs.length} of {todaysJobs.length} jobs found
            {(searchTerm || location) && (
              <span className="ml-2 text-blue-600">
                {searchTerm && `for "${searchTerm}"`}
                {searchTerm && location && " in "}
                {location && `"${location}"`}
              </span>
            )}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search terms or check back later for new postings.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
              {job.isNew && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    NEW
                  </span>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {job.title}
                    </h3>
                    <span className="text-sm text-gray-500 ml-4">{job.posted}</span>
                  </div>
                  
                  <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <button 
                    onClick={() => onNavigate('apply-job', { jobId: job.id, jobTitle: job.title, companyName: job.company, fromPage: 'daily-jobs' })}
                    className="w-full lg:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Don't miss tomorrow's opportunities
            </h3>
            <p className="text-gray-600 mb-4">
              Get daily job highlights delivered to your inbox
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Subscribe to Daily Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyJobsPage;