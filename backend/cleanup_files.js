import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToDelete = [
  // Test files
  'check_and_delete_users.js',
  'check_db.py',
  'check_jobs.js',
  'check_login.js',
  'check_user.js',
  'diagnose.js',
  'test_auth_workflow.js',
  'test_login_errors.js',
  'test_mistral_api.js',
  
  // Old server files
  'app_fixed.py',
  'app.py',
  'minimal_server.py',
  'server-clean.js',
  'simple_app.py',
  'simple_chat_server.py',
  'simple_server.py',
  'working_server.py',
  
  // Cleanup scripts
  'clear_all_data.js',
  'clear_companies.js',
  'delete_all_users.js',
  'fix_employer_login.py',
  'fix_existing_jobs.py',
  'fix_users.js',
  'fix_users.py',
  'safe_cleanup.js',
  
  // Sample data scripts
  'add_companies.js',
  'add_sample_candidates.py',
  'add_sample_jobs.js',
  'find_trinitetech_jobs.js',
  'restore_jobs.js',
  'restore_trinitetech_jobs.js',
  
  // Debug files
  'debug_jobs.py',
  'debug_save.py',
  'chatbot.py',
  'ingest.py',
  'list_models.py',
  'run.py',
  'wsgi.py'
];

let deletedCount = 0;
let notFoundCount = 0;

console.log('🧹 Starting cleanup...\n');

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`⚠️  Not found: ${file}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${file}: ${error.message}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Deleted: ${deletedCount} files`);
console.log(`   Not found: ${notFoundCount} files`);
console.log(`\n✨ Cleanup complete!`);
