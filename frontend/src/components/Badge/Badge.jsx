import React from 'react';
import './Badge.css';

/**
 * Reusable status badge component
 *
 * @param {object} props
 * @param {string} [props.variant='neutral'] - 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg'
 * @param {boolean} [props.dot=false] - Whether to show a leading status pulse dot
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.className] - Extra CSS classes
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...rest
}) {
  return (
    <span className={`tapid-badge tapid-badge--${variant} tapid-badge--${size} ${className}`} {...rest}>
      {dot && <span className={`tapid-badge__dot tapid-badge__dot--${variant}`} />}
      {children}
    </span>
  );
}

export default Badge;
