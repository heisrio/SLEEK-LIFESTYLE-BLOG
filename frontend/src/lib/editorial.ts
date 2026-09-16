import type { BlogPost, Category } from '../types';

const dayKey = () => new Date().toISOString().slice(0, 10);

const hash = (value: string) => {
  let hashed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashed ^= value.charCodeAt(index);
    hashed = Math.imul(hashed, 16777619);
  }
  return hashed >>> 0;
};

/** A predictable shuffle that changes once per day, avoiding UI jitter on render. */
export const stableShuffle = <T extends { _id: string }>(items: T[], salt: string) =>
  [...items].sort((left, right) => hash(`${salt}:${left._id}`) - hash(`${salt}:${right._id}`));

const dateValue = (post: BlogPost) =>
  new Date(post.publishedAt ?? post.createdAt).getTime() || 0;

const scoreTrending = (post: BlogPost) =>
  (post.featured ? 1000000 : 0) + (post.views ?? 0) * 8 + dateValue(post) / 1000000000;

export const categoryBalanced = (posts: BlogPost[], salt: string, limit = 6) => {
  const buckets = new Map<Category, BlogPost[]>();
  posts.forEach((post) => {
    const collection = buckets.get(post.category) ?? [];
    collection.push(post);
    buckets.set(post.category, collection);
  });

  const categories = stableShuffle(
    [...buckets.keys()].map((category) => ({ _id: category, category })),
    salt,
  ).map(({ category }) => category);
  const shuffledBuckets = new Map(
    categories.map((category) => [
      category,
      stableShuffle(buckets.get(category) ?? [], `${salt}:${category}`),
    ]),
  );

  const result: BlogPost[] = [];
  let round = 0;
  while (result.length < limit) {
    const addedThisRound = categories.some((category) => {
      const candidate = shuffledBuckets.get(category)?.[round];
      if (!candidate) return false;
      result.push(candidate);
      return result.length < limit;
    });
    if (!addedThisRound) break;
    round += 1;
  }
  return result.slice(0, limit);
};

export interface EditorialFeed {
  hero?: BlogPost;
  trending: BlogPost[];
  discovery: BlogPost[];
  categorySpotlight: Array<{ category: Category; posts: BlogPost[] }>;
}

export const buildEditorialFeed = (posts: BlogPost[]): EditorialFeed => {
  const published = posts.filter((post) => post.status === 'Published');
  const sortedByRelevance = [...published].sort(
    (left, right) => scoreTrending(right) - scoreTrending(left),
  );
  const hero = sortedByRelevance[0];
  const withoutHero = sortedByRelevance.filter((post) => post._id !== hero?._id);
  const trending = stableShuffle(withoutHero.slice(0, 8), `trending:${dayKey()}`).slice(0, 4);
  const assigned = new Set([hero?._id, ...trending.map((post) => post._id)]);
  const discovery = categoryBalanced(
    published.filter((post) => !assigned.has(post._id)),
    `discovery:${dayKey()}`,
    6,
  );
  discovery.forEach((post) => assigned.add(post._id));

  const categories = [...new Set(published.map((post) => post.category))].slice(0, 4);
  const categorySpotlight = categories.map((category) => ({
    category,
    posts: stableShuffle(
      published.filter((post) => post.category === category && !assigned.has(post._id)),
      `category:${category}:${dayKey()}`,
    ).slice(0, 3),
  }));

  return { hero, trending, discovery, categorySpotlight };
};

export const relatedPosts = (current: BlogPost, posts: BlogPost[]) => {
  const matchingCategory = posts.filter(
    (post) => post._id !== current._id && post.category === current.category,
  );
  const fallback = posts.filter(
    (post) => post._id !== current._id && post.category !== current.category,
  );
  return [...stableShuffle(matchingCategory, `related:${current._id}`), ...stableShuffle(fallback, `more:${current._id}`)].slice(0, 3);
};
