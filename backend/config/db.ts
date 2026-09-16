
import mongoose from '../lib/mongoose-shim';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Post from '../models/Post';

const DEFAULT_USERS: Array<{ name: string; email: string; password: string; role: 'admin' | 'editor' }> = [
  { name: 'Amara James', email: 'admin@kulture.com', password: 'KultureAdmin2026!', role: 'admin' },
  { name: 'Nia Cole', email: 'editor@kulture.com', password: 'KultureEditor2026!', role: 'editor' },
];

const imagePool = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=85',
];

const storyBank: Record<string, string[]> = {
  Beauty: [
    'The five-minute ritual that makes a morning feel yours', 'Skinimalism is not giving up, it is paying attention',
    'A love letter to the lipstick you keep in every bag', 'What your nightstand says about your beauty language',
    'The quiet luxury of washing your face before bed', 'How to build a fragrance wardrobe with feeling',
    'The case for doing less, but doing it beautifully', 'The women making natural hair a living archive',
    'A room-by-room guide to a softer beauty ritual', 'The beauty rules worth breaking this season',
  ],
  Style: [
    'The return of getting dressed for no one but yourself', 'Three silhouettes that make room for a whole life',
    'How to find your signature colour and actually wear it', 'The art of the repeat outfit',
    'Why the best wardrobes begin with a good white shirt', 'A field guide to dressing with more confidence',
    'The new rules of occasion dressing', 'What makes a vintage piece feel modern',
    'The accessories that change the temperature of a look', 'The women with the most interesting closets',
  ],
  Culture: [
    'The soft power of women who make space for one another', 'A new vocabulary for ambition',
    'Why friendship is the most radical form of infrastructure', 'The joy of being a beginner in public',
    'The women archiving the stories we were told to forget', 'What we mean when we say main character energy',
    'A field note on taste, instinct, and knowing yourself', 'The pleasure of a life with fewer explanations',
    'How to build a room that keeps your secrets', 'The future belongs to the women who gather',
  ],
  Music: [
    'The playlist for walking home with your shoulders back', 'Women producers changing the shape of the night',
    'Why the best songs feel like a private conversation', 'The albums that taught us how to leave',
    'A DJ set for getting ready slowly', 'The sound of summer according to five women',
    'How a great bassline changes a room', 'The artists turning tenderness into a full-volume statement',
    'A listening guide for your next reinvention', 'The songs we keep returning to when words fail',
  ],
  Wellness: [
    'Rest is a practice, not a reward', 'The pleasure of building a slower Sunday',
    'How to make movement feel like a thank you', 'The little boundaries that protect a big life',
    'A gentler way to think about productivity', 'The morning walk as a meeting with yourself',
    'What it means to feel at home in your body', 'A guide to making your home hold you better',
    'The rituals that help us come back to centre', 'Why softness can be a serious form of strength',
  ],
  News: [
    'The women shaping what comes next', 'Five ideas we are taking into the new season',
    'The cultural moments that deserve a longer look', 'A closer read on the new creative economy',
    'Who gets to define the future of beauty now', 'The quiet revolutions happening in plain sight',
    'The founders building businesses around a better life', 'What the next generation is refusing to inherit',
    'The movements making room at the table', 'A dispatch from the women changing the brief',
  ],
};

const makeContent = (category: string, title: string, image: string, index: number) => ({
  type: 'doc',
  content: [
    { type: 'image', attrs: { src: image, alt: `${category} editorial image` } },
    { type: 'paragraph', content: [{ type: 'text', text: `There is a particular kind of clarity that arrives when a woman stops performing the version of herself that other people can understand. ${title} begins there: in the small decisions, private rituals, and bright instincts that make a life feel unmistakably her own.` }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Start with the feeling, then make it visible.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: `For KULTURE, this is less about a trend than a way of moving through the world. It is the choice to notice texture, to ask better questions, and to let beauty be useful. The women we return to are not waiting for permission; they are editing the brief as they go.` }] },
    { type: 'image', attrs: { src: imagePool[(index + 3) % imagePool.length], alt: `A detail from the ${category.toLowerCase()} story` } },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The most lasting style is the one that gives you more of yourself back.' }] }] },
    { type: 'paragraph', content: [{ type: 'text', text: `That is the invitation: keep what makes you feel present, release what makes you feel smaller, and build a personal language with enough room to change. Read this as a field note, not a rulebook. Your version is the one worth keeping.` }] },
  ],
});

const seedPosts = async () => {
  if (await Post.exists()) return;
  const posts = Object.entries(storyBank).flatMap(([category, titles], categoryIndex) => titles.map((title, index) => {
    const image = imagePool[(categoryIndex * 2 + index) % imagePool.length];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      title,
      slug,
      excerpt: `A KULTURE field note on ${title.toLowerCase()}, with more feeling and fewer rules.`,
      content: makeContent(category, title, image, categoryIndex + index),
      featuredImage: image,
      category,
      status: 'Published',
      author: index % 2 ? 'Nia Cole' : 'Amara James',
      tags: [category.toLowerCase(), 'women', 'kulture'],
      featured: category === 'Style' && index === 0,
      readTime: 5 + (index % 4),
      views: 0,
      publishedAt: new Date(Date.now() - ((categoryIndex * 10 + index) * 86400000)),
    };
  }));
  await Post.insertMany(posts);
  console.log(`Seeded ${posts.length} KULTURE editorial stories.`);
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/kulture';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoUri}`);
  }

  // Seed predictable local accounts once, while preserving any existing users.
  for (const account of DEFAULT_USERS) {
    const exists = await User.exists({ email: account.email });
    if (!exists) {
      await User.create({ ...account, password: await bcrypt.hash(account.password, 12) });
      console.log(`Seeded ${account.role}: ${account.email}`);
    }
  }

  await seedPosts();
};

export default connectDB;
