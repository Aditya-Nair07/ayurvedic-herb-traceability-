const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const demoUsers = [
  {
    userId: 'farmer001',
    username: 'john_farmer',
    email: 'john@farm.com',
    password: 'password123',
    role: 'farmer',
    organization: 'Green Valley Farms',
    profile: {
      firstName: 'John',
      lastName: 'Farmer',
      phone: '+91-9876543210'
    }
  },
  {
    userId: 'processor001',
    username: 'mary_processor',
    email: 'mary@process.com',
    password: 'password123',
    role: 'processor',
    organization: 'Herb Processing Co',
    profile: {
      firstName: 'Mary',
      lastName: 'Processor',
      phone: '+91-9876543211'
    }
  },
  {
    userId: 'lab001',
    username: 'dr_smith',
    email: 'smith@lab.com',
    password: 'password123',
    role: 'laboratory',
    organization: 'Quality Lab Services',
    profile: {
      firstName: 'Dr. Smith',
      lastName: 'Lab',
      phone: '+91-9876543212'
    }
  },
  {
    userId: 'regulator001',
    username: 'regulator_jane',
    email: 'jane@gov.com',
    password: 'password123',
    role: 'regulator',
    organization: 'Ministry of AYUSH',
    profile: {
      firstName: 'Jane',
      lastName: 'Regulator',
      phone: '+91-9876543213'
    }
  }
];

async function seedDemoUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic-traceability';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create demo users
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username} (${userData.role})`);
    }
    
    console.log('Demo users created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Farmer: john_farmer / password123');
    console.log('Processor: mary_processor / password123');
    console.log('Lab: dr_smith / password123');
    console.log('Regulator: regulator_jane / password123');
    
  } catch (error) {
    console.error('Error seeding demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDemoUsers();
