import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load datasets
const jobTitlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/job_titles.json')));
const skillsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/skills.json')));
const locationsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/locations.json')));

function filterList(list, q) {
  if (!q || q.length < 1) return [];
  q = q.toLowerCase();
  return list.filter(item => item.toLowerCase().includes(q)).slice(0, 10);
}

console.log('Testing suggest API...\n');

// Test job titles
console.log('Job Titles for "account":');
const jobResults = filterList(jobTitlesData.job_titles, 'account');
console.log(jobResults);
console.log('');

// Test skills
console.log('Skills for "py":');
const skillResults = filterList(skillsData.skills, 'py');
console.log(skillResults);
console.log('');

// Test locations
console.log('Locations for "chen":');
const locationResults = filterList(locationsData.locations, 'chen');
console.log(locationResults);
console.log('');

console.log('Dataset sizes:');
console.log('Job titles:', jobTitlesData.job_titles.length);
console.log('Skills:', skillsData.skills.length);
console.log('Locations:', locationsData.locations.length);