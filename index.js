import express from 'express';
import connectToDb from './database/dbConnection.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/eventRoutes.js'; // Now using default export
import profileRoutes from './routes/profileRoutes.js';
import patientsRoutes from './routes/patientsRoutes.js';
import refferalRoutes from './routes/refferalRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config(); 

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://fmp-wellness.netlify.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// API routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/refferals', refferalRoutes);
app.use("/api/v1/reports", reportRoutes);

// Port number and MongoDB URI
const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI;

// Connect to database and start server
const connectDbServer = async () => {
    try {
        await connectToDb(mongo_uri);
        app.listen(port, '0.0.0.0', () => {
            console.log(`✅ Server listening on port ${port}`);
            console.log(`✅ Connected to MongoDB`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

connectDbServer();