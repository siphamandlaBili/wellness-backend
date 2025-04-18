import express from 'express';
import connectToDb from './database/dbConnection.js';
import authRoutes from './routes/auth.js'
import dotenv from 'dotenv';
dotenv.config();

//express instance/server
const app = express();

//middleware
app.use(express.json());
app.use('/api/v1',authRoutes)

//port number, mongo_uri
const port = process.env.PORT;
const mongo_uri = process.env.MONGO_URI;

// connect db and start server
const connectDbServer = async ()=>{
    try {
        await connectToDb(mongo_uri);
        app.listen(port,()=>{
            console.log(`server listening on port ${port}`)
        })
    } catch (error) {
        console.log(error.message)
    }
}

connectDbServer();