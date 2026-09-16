import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postApi } from '../lib/api';
import { CATEGORIES, CATEGORY_DESCRIPTIONS, DEFAULT_FEATURE_IMAGE } from '../constants';
import { PostCard } from '../components/PostCard';
import { Icon } from '../components/Icon';
import type { Category } from '../types';

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Home() {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const postsQuery = useQuery({ queryKey: ['posts', 'published'], queryFn: () => postApi.list({ sort: 'latest' }) });
  const posts = useMemo(() => (postsQuery.data ?? []).filter((post) => post.status === 'Published'), [postsQuery.data]);
  const filteredPosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return posts.filter((post) => (category === 'All' || post.category === category) && (!query || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query)));
  }, [category, deferredSearch, posts]);
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const trending = useMemo(() => shuffle(posts.filter((post) => post.slug !== featured?.slug)).slice(0, 3), [posts, featured?.slug]);

  return (
    <div className="home-page shell">
      <section className="home-intro">
        <div className="home-intro__copy">
          <p className="eyebrow"><span /> The culture, in full colour</p>
          <h1>Life, but<br /><em>make it iconic.</em></h1>
          <p className="home-intro__lede">A point of view on beauty, style, sound, and the women changing the temperature of the room.</p>
          <div className="search-field"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the edit" aria-label="Search stories" /><span>⌘ K</span></div>
        </div>
        <div className="home-intro__visual"><div className="image-frame image-frame--hero"><img src={featured?.featuredImage || DEFAULT_FEATURE_IMAGE} alt={featured?.title || 'KULTURE editorial cover'} /></div><div className="hero-note"><span>01</span><span>Notes from the<br />front row</span></div><span className="hero-stamp">K<br />26</span></div>
      </section>
      <section className="category-strip" aria-label="Browse by category"><button className={category === 'All' ? 'is-active' : ''} onClick={() => setCategory('All')}>All stories</button>{CATEGORIES.map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</section>
      {postsQuery.isLoading ? <div className="loading-state">Curating the latest from the house...</div> : postsQuery.isError ? <div className="empty-state"><h2>The edit is taking a breath.</h2><p>Start the API to load the latest stories from MongoDB.</p></div> : <>
        {featured && category === 'All' && !deferredSearch && <section className="feature-section"><div className="section-heading"><p className="eyebrow"><span /> Editor's pick</p><span>01 / 06</span></div><PostCard post={featured} variant="feature" priority /></section>}
        <section className="story-section"><div className="section-heading"><div><p className="eyebrow"><span /> {category === 'All' ? 'Trending now' : category}</p><h2>{category === 'All' ? 'The stories setting the tone.' : CATEGORY_DESCRIPTIONS[category]}</h2></div><span>{filteredPosts.length.toString().padStart(2, '0')} stories</span></div>{(category === 'All' && !deferredSearch ? trending : filteredPosts).length ? <div className="story-grid">{(category === 'All' && !deferredSearch ? trending : filteredPosts).map((post) => <PostCard key={post.slug} post={post} />)}</div> : <div className="empty-state"><h2>No stories found.</h2><p>Try another category or search phrase.</p></div>}</section>
        {category === 'All' && !deferredSearch && <section className="latest-section"><div className="section-heading"><div><p className="eyebrow"><span /> Just in</p><h2>Fresh from the KULTURE desk.</h2></div><span>06 latest</span></div><div className="latest-grid">{posts.slice(0, 6).map((post) => <PostCard key={`latest-${post.slug}`} post={post} variant="compact" />)}</div></section>}
      </>}
    </div>
  );
}