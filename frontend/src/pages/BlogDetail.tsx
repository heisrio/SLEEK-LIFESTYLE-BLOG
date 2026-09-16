import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { postApi } from '../lib/api';
import { getAuthorInitials, getAuthorName, type BlogPost } from '../types';
import ContentRenderer from '../components/ContentRenderer';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  // Detail data shares the same TanStack Query cache as the editorial surfaces.
  const postQuery = useQuery({ queryKey: ['post', slug], queryFn: () => postApi.bySlug(slug!), enabled: Boolean(slug) });

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (postQuery.isLoading) return <div className="loading-state">Opening the story...</div>;
  const post = postQuery.data as BlogPost | undefined;
  if (!post) return <div className="empty-state"><h2>Story not found.</h2><Link className="text-link" to="/">Back to the edit</Link></div>;

  return <article className="article-page shell"><Link className="text-link article-back" to="/">← Back to the edit</Link><header className="article-header"><div className="article-kicker"><span>{post.category}</span><span>{new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}</span></div><h1>{post.title}</h1><p>{post.excerpt}</p><div className="article-author"><div>{getAuthorInitials(post)}</div><span>Words by <strong>{getAuthorName(post)}</strong></span></div></header>{post.featuredImage && <img className="article-hero" src={post.featuredImage} alt={post.title} /> }<ContentRenderer content={post.content} /></article>;
}