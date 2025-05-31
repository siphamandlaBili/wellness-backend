import express from 'express';
import connectToDb from './database/dbConnection.js';
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/eventRoutes.js'
import profileRoutes from './routes/profileRoutes.js';
import patientsRoutes from './routes/patientsRoutes.js'
import refferalRoutes from './routes/refferalRoutes.js'
import reportRoutes from "./routes/reportRoutes.js";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from "cors";
dotenv.config();

//express instance/server
const app = express();
//check health aws
console.log('✅ App started');
app.get('/health', (req, res) => {
    console.log("endpoint")
    res.status(200).json({ status: 'ok' });
  });
//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cookieParser());
app.use(express.json());
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


app.use('/api/v1',authRoutes)
app.use('/api/v1/events',eventRoutes)
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/refferals', refferalRoutes);
app.use("/api/v1/reports", reportRoutes);

//port number, mongo_uri
const port = process.env.PORT;
const mongo_uri = process.env.MONGO_URI;

// connect db and start server
const connectDbServer = async ()=>{
    try {
        await connectToDb(mongo_uri);
        app.listen(port,'0.0.0.0',()=>{
            console.log(`server listening on port ${port}`)
        })
    } catch (error) {
        console.log(error.message)
    }
}

connectDbServer();