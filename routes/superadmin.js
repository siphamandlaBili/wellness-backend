import express from 'express';
import {
  getAllAdmins,
  getAdmin,
  deleteAdmin,
  getAllNurses,
  getNurse,
  deleteNurse
} from '../controllers/superAdmin.js';

const superRoute = express.Router();

// Admin routes
superRoute.get('/admins', getAllAdmins);
superRoute.get('/admins/:id', getAdmin);
superRoute.delete('/admins/:id', deleteAdmin);

// Nurse routes
superRoute.get('/nurse', getAllNurses);
superRoute.get('/nurse/:id', getNurse);
superRoute.delete('/nurse/:id', deleteNurse);

export default superRoute;
