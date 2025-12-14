import fs from 'fs';
import path from 'path';

// List of safe-to-delete test files
const testFiles = [
  'test_complete_flow.js',
  'test_add_application.js',
  'check_applications.js',
  'fix_application_jobid.js',
  'test_email_functionality.js',
  'clean_profiles.js'
];

// Files to keep (important for the application)
const keepFiles = [
  'server.js',
  'run.py',
  'app.py',
  'package.json',
  'requirements.txt',
  '.env',
  '.env.example'
];

function safeCleanup() {
  console.log('🧹 Safe cleanup of test files...\n');

  let deletedCount = 0;
  let skippedCount = 0;

  testFiles.forEach(filename => {
    const filePath = path.join(process.cwd(), filename);
    
    if (fs.existsSync(filePath)) {
      try {
        // Double check it's not a critical file
        if (!keepFiles.includes(filename)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted: ${filename}`);
          deletedCount++;
        } else {
          console.log(`⚠️  Skipped (important): ${filename}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Failed to delete ${filename}: ${error.message}`);
      }
    } else {
      console.log(`ℹ️  Not found: ${filename}`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Deleted: ${deletedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
  console.log(`\n✅ Cleanup completed safely!`);
  console.log(`   Your main application files are untouched.`);
}

safeCleanup();