import ky, { HTTPError } from 'ky';
import type { AuthResponse, BlogPost, PaginatedPosts, PostInput, User } from '../types';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const client = ky.create({
  prefix: `${baseUrl.replace(/\/$/, '')}/`,
  timeout: 15000,
  retry: { limit: 1, methods: ['get'] },
});

const withToken = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

const unwrap = <T>(payload: T | { data: T }): T =>
  typeof payload === 'object' && payload !== null && 'data' in payload
    ? (payload as { data: T }).data
    : (payload as T);

const request = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof HTTPError) {
      const body = await error.response
        .json<{ message?: string; error?: string }>()
        .catch(() => undefined);
      throw new ApiError(body?.message ?? body?.error ?? 'Something went wrong.', error.response.status);
    }
    if (error instanceof Error) throw new ApiError(error.message);
    throw new ApiError('We could not reach the server.');
  }
};

export interface PostQuery {
  category?: string;
  search?: string;
  scope?: 'all';
  page?: number;
  limit?: number;
  sort?: 'latest' | 'trending';
}

export const authApi = {
  login: (email: string, password: string) =>
    request(
      client
        .post('auth/login', { json: { email, password } })
        .json<AuthResponse | { data: AuthResponse }>()
        .then(unwrap),
    ),
  profile: (token: string) =>
    request(
      client
        .get('auth/me', { headers: withToken(token) })
        .json<User | { data: User }>()
        .then(unwrap),
    ),
};

export const postApi = {
  list: (query: PostQuery = {}, token?: string) => {
    const searchParams = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
    );
    return request(
      client
        .get('posts', { searchParams, headers: withToken(token) })
        .json<BlogPost[] | PaginatedPosts | { data: BlogPost[] | PaginatedPosts }>()
        .then((payload) => {
          const result = unwrap(payload);
          return Array.isArray(result) ? result : result.posts;
        }),
    );
  },
  bySlug: (slug: string) =>
    request(
      client
        .get(`posts/${encodeURIComponent(slug)}`)
        .json<BlogPost | { data: BlogPost }>()
        .then(unwrap),
    ),
  create: (input: PostInput, token: string) =>
    request(
      client
        .post('posts', { json: input, headers: withToken(token) })
        .json<BlogPost | { data: BlogPost }>()
        .then(unwrap),
    ),
  update: (id: string, input: PostInput, token: string) =>
    request(
      client
        .put(`posts/${id}`, { json: input, headers: withToken(token) })
        .json<BlogPost | { data: BlogPost }>()
        .then(unwrap),
    ),
  remove: (id: string, token: string) =>
    request(client.delete(`posts/${id}`, { headers: withToken(token) }).json<unknown>()),
  uploadImage: (file: File, token: string) => {
    const formData = new FormData();
    formData.set('image', file);
    return request(
      client
        .post('uploads', { body: formData, headers: withToken(token) })
        .json<{ url: string } | { data: { url: string } }>()
        .then((payload) => unwrap(payload).url),
    );
  },
};
