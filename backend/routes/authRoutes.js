const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const { registerUser, loginUser } = require('../controllers/authController');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for buffer upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: upload buffer to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'profile_images' }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Update user profile with optional image upload
router.put('/update/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const updateData = { name, email, address };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      updateData.profileImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// ✅ Change Password Route
// ✅ Change Password Route (using matchPassword)
router.put('/change-password/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword); // 🔁 Using model method
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    user.password = newPassword; // Will be hashed in pre('save')
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

module.exports = router;
