import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { JSONContent } from '@tiptap/core';
import { CATEGORIES, DEFAULT_FEATURE_IMAGE } from '../constants';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../lib/api';
import { Icon } from '../components/Icon';
import TipTapEditor from '../components/TipTapEditor';
import type { BlogPost, Category, PostInput, PostStatus } from '../types';

const emptyPost = (): PostInput => ({
  title: '',
  slug: '',
  excerpt: '',
  content: { type: 'doc', content: [{ type: 'paragraph' }] },
  featuredImage: DEFAULT_FEATURE_IMAGE,
  category: 'Style',
  status: 'Draft',
  tags: [],
  featured: false,
  readTime: 5,
});

export default function AdminDashboard() {
  const { user, token, isBooting, hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PostInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const postsQuery = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: () => postApi.list({ scope: 'all', sort: 'latest' }, token ?? undefined),
    enabled: Boolean(token && user && hasRole('admin', 'editor')),
  });

  // Mutations invalidate both public and studio lists so every screen sees the saved Mongo document.
  const saveMutation = useMutation({
    mutationFn: (input: PostInput) => editingId
      ? postApi.update(editingId, input, token!)
      : postApi.create(input, token!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      setDraft(null);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postApi.remove(id, token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  useEffect(() => {
    if (!isBooting && (!user || !hasRole('admin', 'editor'))) navigate('/signin', { replace: true });
  }, [hasRole, isBooting, navigate, user]);

  if (isBooting || !user) return <div className="loading-state">Opening the studio...</div>;
  if (!hasRole('admin', 'editor')) return null;

  const updateDraft = <Key extends keyof PostInput>(key: Key, value: PostInput[Key]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const editPost = (post: BlogPost) => {
    setEditingId(post._id);
    setDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content as JSONContent,
      featuredImage: post.featuredImage,
      category: post.category,
      status: post.status,
      tags: post.tags ?? [],
      featured: Boolean(post.featured),
      readTime: post.readTime,
    });
  };

  const updateTitle = (title: string) => {
    updateDraft('title', title);
    updateDraft('slug', title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  return (
    <div className="studio-page shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow"><span /> KULTURE content studio</p>
          <h1>Make the <em>edit.</em></h1>
          <p>{user.name} / {user.role} access</p>
        </div>
        <button className="button button--lime" onClick={() => { setDraft(emptyPost()); setEditingId(null); }}>
          <Icon name="plus" /> New story
        </button>
      </header>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <div className="studio-stat"><strong>{postsQuery.data?.length ?? 0}</strong><span>Total stories</span></div>
          <div className="studio-stat"><strong>{postsQuery.data?.filter((post) => post.status === 'Published').length ?? 0}</strong><span>Published</span></div>
          <p className="studio-caption">Draft, shape, and publish the stories women are already waiting for.</p>
        </aside>

        <section className="studio-content">
          {draft ? (
            <div className="editor-panel">
              <div className="editor-panel__top">
                <button className="icon-button" onClick={() => { setDraft(null); setEditingId(null); }} aria-label="Close editor"><Icon name="close" /></button>
                <div><p className="eyebrow"><span /> {editingId ? 'Editing story' : 'New story'}</p><h2>{draft.title || 'Untitled story'}</h2></div>
                <button className="button button--dark" disabled={saveMutation.isPending || !draft.title.trim()} onClick={() => saveMutation.mutate(draft)}>
                  {saveMutation.isPending ? 'Saving...' : 'Save story'}
                </button>
              </div>
              {saveMutation.isError && <p className="form-error">{saveMutation.error.message}</p>}
              <div className="editor-grid">
                <div>
                  <input className="title-input" value={draft.title} onChange={(event) => updateTitle(event.target.value)} placeholder="Story title" />
                  <TipTapEditor value={draft.content as JSONContent} onChange={(content) => updateDraft('content', content)} onUpload={token ? (file) => postApi.uploadImage(file, token) : undefined} />
                </div>
                <aside className="editor-settings">
                  <label>Category<select value={draft.category} onChange={(event) => updateDraft('category', event.target.value as Category)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
                  <label>Status<select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as PostStatus)}><option>Draft</option><option>Published</option></select></label>
                  <label>Excerpt<textarea rows={5} value={draft.excerpt} onChange={(event) => updateDraft('excerpt', event.target.value)} placeholder="A sharp invitation to read on..." /></label>
                  <label>Cover image<input value={draft.featuredImage ?? ''} onChange={(event) => updateDraft('featuredImage', event.target.value)} /></label>
                  <label>Tags<input value={draft.tags.join(', ')} onChange={(event) => updateDraft('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="beauty, women, style" /></label>
                  <label className="check-row"><input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft('featured', event.target.checked)} /> Feature on home</label>
                </aside>
              </div>
            </div>
          ) : (
            <>
              <div className="list-heading"><div><p className="eyebrow"><span /> Your library</p><h2>Stories in motion</h2></div><span>{postsQuery.isFetching ? 'Refreshing...' : 'MongoDB / live'}</span></div>
              {postsQuery.isError && <p className="form-error">{postsQuery.error.message}</p>}
              <div className="post-list">
                {postsQuery.data?.map((post) => <article className="studio-row" key={post._id}>
                  <img src={post.featuredImage || DEFAULT_FEATURE_IMAGE} alt="" />
                  <div><span className="status-label">{post.status} / {post.category}</span><h3>{post.title}</h3><p>{post.excerpt || 'No excerpt yet.'}</p></div>
                  <div className="row-actions"><button className="icon-button" onClick={() => editPost(post)} aria-label={`Edit ${post.title}`}><Icon name="edit" /></button><button className="icon-button icon-button--danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(post._id)} aria-label={`Delete ${post.title}`}><Icon name="trash" /></button></div>
                </article>)}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}