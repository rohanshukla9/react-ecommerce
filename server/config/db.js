import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(
      `MongoDB conencted: ${connection.connection.host}`.cyan.underline
    );
  } catch (error) {
    console.error(`Error is ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

export default connectDB;
