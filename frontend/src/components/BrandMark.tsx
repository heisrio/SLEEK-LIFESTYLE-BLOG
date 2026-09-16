import { Link } from 'react-router';
import { BRAND_NAME } from '../constants';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export const BrandMark = ({ compact = false, className = '' }: BrandMarkProps) => (
  <Link to="/" className={`brand-mark ${className}`.trim()} aria-label={`${BRAND_NAME} home`}>
    <span className="brand-symbol" aria-hidden="true">K</span>
    {!compact && <span className="brand-wordmark">{BRAND_NAME}</span>}
  </Link>
);
