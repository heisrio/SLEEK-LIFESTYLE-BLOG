
import mongoose from '../lib/mongoose-shim';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
  image: String,
});

export default mongoose.model('User', UserSchema);
