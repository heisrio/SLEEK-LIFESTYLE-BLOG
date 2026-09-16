
import User from '../models/User';
import connectDB from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'kulture_local_secret_change_me';

export const loginUser = async (email: string, pass: string) => {
  await connectDB();
  
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(pass, user.password)) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' }),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const getUserProfile = async (userId: string) => {
  await connectDB();
  const user = await User.findById(userId).select('-password');
  return user;
};
