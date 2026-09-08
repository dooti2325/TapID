import React from 'react';
import './Cards.css';

/**
 * Reusable Glassmorphic Container Card
 *
 * @param {object} props
 * @param {string} [props.title] - Card title
 * @param {string} [props.subtitle] - Card subtitle
 * @param {React.ReactNode} [props.action] - Right header action buttons/controls
 * @param {React.ReactNode} props.children - Body content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {string} [props.className] - Additional classes
 */
export function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  ...rest
}) {
  return (
    <div className={`tapid-card glass-panel ${className}`} {...rest}>
      {(title || action) && (
        <div className="tapid-card__header">
          <div>
            {title && <h3 className="tapid-card__title">{title}</h3>}
            {subtitle && <p className="tapid-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="tapid-card__action">{action}</div>}
        </div>
      )}

      <div className="tapid-card__body">{children}</div>

      {footer && <div className="tapid-card__footer">{footer}</div>}
    </div>
  );
}

export default Card;
