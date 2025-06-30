// controllers/profileController.js
import  User  from '../models/userModel.js';
import cloudinary from '../utils/cloudinary.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('User not found');

    // Handle text fields from form-data
    const updates = {
      fullName: req.body.fullName || user.fullName,
      phone: req.body.phone || user.phone,
      bio: req.body.bio || user.bio,
    };

    // Handle image upload
    if (req.file) {
      if (user.image) {
        const publicId = user.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`wellness-profiles/${publicId}`);
      }
      updates.image = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};