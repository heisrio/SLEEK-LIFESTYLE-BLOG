
import User from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'kulture_local_secret_change_me';

export const protect = async (token: string | null) => {
  if (!token) {
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new Error('Not authorized, user not found');
    }

    return user;
  } catch (error) {
    throw new Error('Not authorized, token failed');
  }
};

export const admin = (user: any) => {
  if (user && user.role === 'admin') {
    return true;
  } else {
    throw new Error('Not authorized as an admin');
  }
};
