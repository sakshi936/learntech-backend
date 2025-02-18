import mongoose from 'mongoose';

const dbConnect = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');
    } catch (error) {
        console.log('Error in connecting to DB', error);
        process.exit(1);
    }
};

export default dbConnect;