import fs from 'fs';
import path from 'path';

// Frontend test files to remove
const frontendTestFiles = [
  'check_storage.html',
  'clear_storage.html'
];

// Important files to never delete
const protectedFiles = [
  'index.html',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js'
];

function cleanupFrontend() {
  console.log('🧹 Frontend cleanup...\n');

  let deletedCount = 0;

  frontendTestFiles.forEach(filename => {
    const filePath = path.join(process.cwd(), filename);
    
    if (fs.existsSync(filePath)) {
      if (!protectedFiles.includes(filename)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted: ${filename}`);
          deletedCount++;
        } catch (error) {
          console.log(`❌ Failed to delete ${filename}: ${error.message}`);
        }
      } else {
        console.log(`🔒 Protected: ${filename}`);
      }
    } else {
      console.log(`ℹ️  Not found: ${filename}`);
    }
  });

  console.log(`\n📊 Frontend cleanup: ${deletedCount} files deleted`);
  console.log(`✅ Your main application is safe!`);
}

cleanupFrontend();