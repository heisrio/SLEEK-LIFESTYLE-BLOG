import { Link } from 'react-router';
import { CATEGORY_ACCENTS, DEFAULT_FEATURE_IMAGE } from '../constants';
import { useEditorialUiStore } from '../lib/uiStore';
import { getAuthorName, type BlogPost } from '../types';
import { Icon } from './Icon';

type PostCardVariant = 'feature' | 'story' | 'compact' | 'horizontal';

interface PostCardProps {
  post: BlogPost;
  variant?: PostCardVariant;
  priority?: boolean;
}

const dateLabel = (date?: string) => {
  if (!date) return 'The KULTURE Edit';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
};

export const PostCard = ({ post, variant = 'story', priority = false }: PostCardProps) => {
  const { savedSlugs, toggleSaved } = useEditorialUiStore();
  const isSaved = savedSlugs.includes(post.slug);
  const image = post.featuredImage || DEFAULT_FEATURE_IMAGE;

  return (
    <article className={`post-card post-card--${variant}`}>
      <Link className="post-card__image-link" to={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
        <img className="post-card__image" src={image} alt="" loading={priority ? 'eager' : 'lazy'} />
        <span className={`category-pill category-pill--${CATEGORY_ACCENTS[post.category]}`}>{post.category}</span>
      </Link>
      <div className="post-card__body">
        <div className="post-card__meta">
          <span>{getAuthorName(post)}</span>
          <i />
          <span>{dateLabel(post.publishedAt ?? post.createdAt)}</span>
          {post.readTime && <><i /><span>{post.readTime} min read</span></>}
        </div>
        <Link className="post-card__title-link" to={`/blog/${post.slug}`}>
          <h3>{post.title}</h3>
        </Link>
        {variant !== 'compact' && <p className="post-card__excerpt">{post.excerpt}</p>}
        <div className="post-card__footer">
          <Link className="text-link" to={`/blog/${post.slug}`}>Read story <Icon name="arrow" /></Link>
          <button
            className={`save-button ${isSaved ? 'is-saved' : ''}`}
            type="button"
            aria-label={isSaved ? `Remove ${post.title} from saved stories` : `Save ${post.title}`}
            onClick={() => toggleSaved(post.slug)}
          >
            <Icon name="bookmark" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
