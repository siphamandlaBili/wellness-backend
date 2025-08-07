import User from "../models/userModel.js";

// GET all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET a single admin by ID
export const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOne({ _id: id, role: 'admin' });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE an admin by ID
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdmin = await User.findOneAndDelete({ _id: id, role: 'admin' });

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNurses = async (req, res) => {
  try {
    const admins = await User.find({ role: 'nurse' });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOne({ _id: id, role: 'nurse' });

    if (!admin) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNurse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdmin = await User.findOneAndDelete({ _id: id, role: 'nurse' });

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    res.status(200).json({ message: 'Nurse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};