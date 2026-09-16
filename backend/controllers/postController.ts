
import Post from '../models/Post';
import connectDB from '../config/db';

export const getPosts = async (filter: Record<string, unknown> = {}) => {
  await connectDB();
  return await Post.find(filter).sort({ publishedAt: -1, createdAt: -1 });
};

export const getPostBySlug = async (slug: string) => {
  await connectDB();
  return await Post.findOne({ slug });
};

export const createPost = async (postData: any, authorName: string) => {
  await connectDB();
  const post = new Post({
    ...postData,
    author: authorName,
    publishedAt: postData.status === 'Published' ? new Date() : undefined,
  });
  return await post.save();
};

export const updatePost = async (id: string, postData: any) => {
  await connectDB();
  return await Post.findByIdAndUpdate(id, { ...postData, ...(postData.status === 'Published' ? { publishedAt: new Date() } : {}) }, { new: true, runValidators: true });
};

export const deletePost = async (id: string) => {
  await connectDB();
  return await Post.findByIdAndDelete(id);
};
