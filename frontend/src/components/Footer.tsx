import { Link } from 'react-router';
import { BRAND_NAME, CATEGORIES } from '../constants';
import { BrandMark } from './BrandMark';

export const Footer = () => (
  <footer className="site-footer">
    <div className="shell site-footer__grid">
      <div className="site-footer__intro">
        <BrandMark />
        <p>Women, culture, beauty, sound and style, told with intention.</p>
        <span className="footer-note">For every woman becoming more herself.</span>
      </div>
      <div>
        <span className="footer-heading">Explore</span>
        <div className="footer-links">
          <Link to="/">The Edit</Link>
          {CATEGORIES.slice(0, 3).map((category) => <Link key={category} to={`/?category=${category}`}>{category}</Link>)}
        </div>
      </div>
      <div>
        <span className="footer-heading">The house</span>
        <div className="footer-links">
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="mailto:hello@kulture.com">Contact</a>
          <Link to="/signin">Editorial studio</Link>
        </div>
      </div>
      <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
        <label className="footer-heading" htmlFor="newsletter-email">In the know</label>
        <p>A monthly note from the KULTURE editorial desk.</p>
        <div className="newsletter-control">
          <input id="newsletter-email" type="email" placeholder="Your email" aria-label="Your email" />
          <button className="round-action" type="submit" aria-label="Subscribe">↗</button>
        </div>
      </form>
    </div>
    <div className="shell site-footer__bottom">
      <span>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</span>
      <span>Made for the main character.</span>
    </div>
  </footer>
);

export default Footer;
