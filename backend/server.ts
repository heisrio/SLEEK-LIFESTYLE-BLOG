import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createPost, deletePost, getPostBySlug, getPosts, updatePost } from './controllers/postController';
import { getUserProfile, loginUser } from './controllers/authController';
import { protect } from './middleware/authMiddleware';
import connectDB from './config/db';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '8mb' }));

const getBearerToken = (request: Request) => {
  const header = request.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

const requireEditor = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = await protect(getBearerToken(request));
    if (!['admin', 'editor'].includes(user.role)) {
      response.status(403).json({ message: 'Editor access is required.' });
      return;
    }
    (request as Request & { user: typeof user }).user = user;
    next();
  } catch (error) {
    response.status(401).json({ message: error instanceof Error ? error.message : 'Not authorized.' });
  }
};

app.get('/api/posts', async (request, response, next) => {
  try {
    const filter: Record<string, unknown> = request.query.scope === 'all' ? {} : { status: 'Published' };
    if (typeof request.query.category === 'string' && request.query.category) filter.category = request.query.category;
    if (typeof request.query.search === 'string' && request.query.search) {
      const safeSearch = request.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ title: { $regex: safeSearch, $options: 'i' } }, { excerpt: { $regex: safeSearch, $options: 'i' } }];
    }
    response.json(await getPosts(filter));
  } catch (error) { next(error); }
});

app.get('/api/posts/:slug', async (request, response, next) => {
  try {
    const post = await getPostBySlug(request.params.slug);
    post ? response.json(post) : response.status(404).json({ message: 'Post not found.' });
  } catch (error) { next(error); }
});

app.post('/api/posts', requireEditor, async (request: Request & { user?: { name: string } }, response, next) => {
  try { response.status(201).json(await createPost(request.body, request.user?.name ?? 'Fentywap Editorial')); } catch (error) { next(error); }
});

app.put('/api/posts/:id', requireEditor, async (request, response, next) => {
  try { response.json(await updatePost(String(request.params.id), request.body)); } catch (error) { next(error); }
});

app.delete('/api/posts/:id', requireEditor, async (request, response, next) => {
  try { response.json(await deletePost(String(request.params.id))); } catch (error) { next(error); }
});

app.post('/api/auth/login', async (request, response) => {
  try { response.json(await loginUser(request.body.email, request.body.password)); } catch (error) { response.status(401).json({ message: error instanceof Error ? error.message : 'Invalid credentials.' }); }
});

app.get('/api/auth/me', async (request, response) => {
  try {
    const user = await protect(getBearerToken(request));
    response.json(user);
  } catch (error) { response.status(401).json({ message: error instanceof Error ? error.message : 'Not authorized.' }); }
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  response.status(500).json({ message: error.message || 'Server error.' });
});

connectDB()
  .then(() => app.listen(port, () => console.log(`KULTURE API listening on http://localhost:${port}`)))
  .catch((error: unknown) => {
    console.error('KULTURE could not connect to MongoDB.', error);
    process.exit(1);
  });