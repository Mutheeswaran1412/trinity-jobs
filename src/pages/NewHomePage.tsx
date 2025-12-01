import React from 'react';
import NewHero from '../components/NewHero';
import JobCategories from '../components/JobCategories';
import LatestJobs from '../components/LatestJobs';
import NewTestimonials from '../components/NewTestimonials';
import CallToAction from '../components/CallToAction';

interface NewHomePageProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
}

const NewHomePage: React.FC<NewHomePageProps> = ({ onNavigate, user }) => {
  return (
    <div className="min-h-screen bg-white">
      <NewHero onNavigate={onNavigate} user={user} />
      <JobCategories onNavigate={onNavigate} />
      <LatestJobs onNavigate={onNavigate} />
      <NewTestimonials />
      <CallToAction onNavigate={onNavigate} />
    </div>
  );
};

export default NewHomePage;