import mongoose from "mongoose";

//connect to databse function
const connectToDb = async(uri) =>{
    return mongoose.connect(uri);
}

export default connectToDb;