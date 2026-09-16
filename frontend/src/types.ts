export type Role = 'admin' | 'editor' | 'user';

export type PostStatus = 'Draft' | 'Published';

export type Category =
  | 'Beauty'
  | 'Style'
  | 'Culture'
  | 'Music'
  | 'Wellness'
  | 'News';

export interface RichContent {
  type?: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<Record<string, unknown>>;
  content?: RichContent[];
}

export interface Author {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  image?: string;
  role?: Role;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: RichContent;
  featuredImage?: string;
  category: Category;
  status: PostStatus;
  author: Author | string;
  authorName?: string;
  tags: string[];
  featured?: boolean;
  views?: number;
  readTime?: number;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: RichContent;
  featuredImage?: string;
  category: Category;
  status: PostStatus;
  tags: string[];
  featured: boolean;
  readTime?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedPosts {
  posts: BlogPost[];
  total?: number;
  page?: number;
  pages?: number;
}

export const getAuthorName = (post: Pick<BlogPost, 'author' | 'authorName'>) => {
  if (post.authorName) return post.authorName;
  return typeof post.author === 'string' ? post.author : post.author.name;
};

export const getAuthorInitials = (post: Pick<BlogPost, 'author' | 'authorName'>) =>
  getAuthorName(post)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
