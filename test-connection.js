import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scheme-finder';

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test if we can access collections
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.log('⚠️  Could not list collections:', err.message);
      } else {
        console.log('📁 Collections found:', collections.length);
        if (collections.length > 0) {
          console.log('   Collections:', collections.map(c => c.name).join(', '));
        }
      }
      
      // Close connection
      mongoose.connection.close();
      console.log('✅ Connection test completed successfully!');
      process.exit(0);
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB Connection Failed!');
    console.log('Error:', error.message);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your MONGODB_URI in .env file');
    console.log('3. If using MongoDB Atlas, check your connection string');
    console.log('4. Verify network/firewall settings');
    process.exit(1);
  });


