const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await User.deleteMany({});
    await Team.deleteMany({});
    
    const teams = await Team.create([
      { name: 'Engineering', description: 'Software development team' },
      { name: 'Marketing', description: 'Marketing and growth team' },
      { name: 'Sales', description: 'Sales and business development' }
    ]);
    
    const users = await User.create([
      { name: 'Admin User', email: 'admin@company.com', role: 'admin', teamId: teams[0]._id },
      { name: 'John Developer', email: 'john@company.com', role: 'user', teamId: teams[0]._id },
      { name: 'Sarah Marketer', email: 'sarah@company.com', role: 'user', teamId: teams[1]._id },
      { name: 'Mike Sales', email: 'mike@company.com', role: 'user', teamId: teams[2]._id }
    ]);
    
    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();