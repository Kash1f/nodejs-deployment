import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch(err) {
    console.log('Error connecting to MongoDB:', err);
    process.exit(1); //exit process with failure
  }
};
