import React from 'react';
import './Loader.css';

/**
 * Shimmering placeholder blocks for tables and cards
 *
 * @param {object} props
 * @param {number} [props.lines=3] - Number of skeleton lines
 * @param {string} [props.height='1rem'] - Line height
 * @param {string} [props.className] - Extra classes
 */
export function SkeletonLoader({ lines = 3, height = '1.25rem', className = '' }) {
  return (
    <div className={`tapid-skeleton-group ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="tapid-skeleton-line"
          style={{
            height,
            width: index === lines - 1 && lines > 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export default SkeletonLoader;
