import React from 'react';
import './Loader.css';

/**
 * Modern animated gradient loading spinner
 *
 * @param {object} props
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} [props.text] - Optional text below spinner
 * @param {boolean} [props.fullPage=false] - Center on full viewport
 */
export function LoadingSpinner({ size = 'md', text, fullPage = false }) {
  const content = (
    <div className={`tapid-spinner-container ${fullPage ? 'tapid-spinner-container--full' : ''}`}>
      <div className={`tapid-spinner tapid-spinner--${size}`} />
      {text && <p className="tapid-spinner__text">{text}</p>}
    </div>
  );

  return content;
}

export default LoadingSpinner;
