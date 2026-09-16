import type { ReactNode } from 'react';

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  copy: string;
  action?: ReactNode;
}

export const EmptyState = ({ eyebrow, title, copy, action }: EmptyStateProps) => (
  <section className="empty-state">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    <p>{copy}</p>
    {action && <div className="empty-state__action">{action}</div>}
  </section>
);
