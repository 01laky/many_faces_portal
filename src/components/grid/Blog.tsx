/**
 * Blog - Single blog post card with image, title and excerpt
 *
 * Uses placeholder images. Layout adapts to container size.
 */

import './Blog.scss';

const PLACEHOLDER_IMG = 'https://picsum.photos/seed/blog1/600/400';

export function Blog() {
  return (
    <div className="blog-component">
      <img className="blog-photo" src={PLACEHOLDER_IMG} alt="Blog post" loading="lazy" />
      <div className="blog-overlay">
        <span className="blog-date">22 Feb 2025</span>
        <span className="blog-title">Getting Started with React 19</span>
        <span className="blog-excerpt">
          Explore the latest features and improvements in React 19...
        </span>
      </div>
    </div>
  );
}
