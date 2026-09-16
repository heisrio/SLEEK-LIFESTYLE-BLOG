
import mongoose from '../lib/mongoose-shim';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: Object, required: true },
  featuredImage: String,
  category: { type: String, default: 'Education' },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  author: { type: String, required: true },
  tags: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  publishedAt: Date,
}, { timestamps: true });

export default mongoose.model('Post', PostSchema);
