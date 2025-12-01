import mongoose from 'mongoose';

const testConnections = async () => {
  const tests = [
    {
      name: "Original URI",
      uri: "mongodb+srv://jobportal_user:jobportal_user@jobportal.pnp4szn.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Jobportal"
    },
    {
      name: "Without database",
      uri: "mongodb+srv://jobportal_user:jobportal_user@jobportal.pnp4szn.mongodb.net/?retryWrites=true&w=majority&appName=Jobportal"
    },
    {
      name: "Admin database",
      uri: "mongodb+srv://jobportal_user:jobportal_user@jobportal.pnp4szn.mongodb.net/admin?retryWrites=true&w=majority&appName=Jobportal"
    }
  ];

  for (const test of tests) {
    console.log(`\nTesting: ${test.name}`);
    try {
      await mongoose.connect(test.uri, { serverSelectionTimeoutMS: 3000 });
      console.log("✅ SUCCESS");
      await mongoose.disconnect();
      break;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
    }
  }
};

testConnections();