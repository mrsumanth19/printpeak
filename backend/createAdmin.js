// createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@printpeak.com' });
    if (adminExists) {
      console.log('✅ Admin already exists');
    } else {
      const admin = new User({
        name: 'Admin',
        email: 'admin@printpeak.com',
        password: 'admin123', // will be hashed by User model
        isAdmin: true,
      });
      await admin.save();
      console.log('✅ Admin created:', admin.email);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  }
};

createAdmin();
