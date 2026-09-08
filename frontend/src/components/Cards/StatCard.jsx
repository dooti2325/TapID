import React from 'react';
import './Cards.css';

/**
 * Reusable Metric/Stat Card with glassmorphism, accent icon glow, and trend indicators
 *
 * @param {object} props
 * @param {string} props.title - Card header label
 * @param {string|number} props.value - Metric value
 * @param {React.ReactNode} [props.icon] - Lucide icon component
 * @param {string} [props.accentColor='blue'] - 'blue' | 'purple' | 'emerald' | 'amber' | 'rose'
 * @param {string} [props.subtitle] - Optional description or trend
 * @param {string} [props.trend] - Optional trend value (e.g. '+12%')
 * @param {boolean} [props.trendUp=true] - Whether the trend is positive
 * @param {boolean} [props.loading=false] - Show skeleton loading state
 * @param {Function} [props.onClick] - Optional click handler
 */
export function StatCard({
  title,
  value,
  icon,
  accentColor = 'blue',
  subtitle,
  trend,
  trendUp = true,
  loading = false,
  onClick,
}) {
  return (
    <div
      className={`tapid-stat-card tapid-stat-card--${accentColor} ${onClick ? 'tapid-stat-card--interactive' : ''}`}
      onClick={onClick}
    >
      <div className="tapid-stat-card__top">
        <span className="tapid-stat-card__title">{title}</span>
        {icon && <div className="tapid-stat-card__icon-wrapper">{icon}</div>}
      </div>

      <div className="tapid-stat-card__bottom">
        {loading ? (
          <div className="tapid-stat-card__skeleton" />
        ) : (
          <h3 className="tapid-stat-card__value">{value ?? '—'}</h3>
        )}

        <div className="tapid-stat-card__footer">
          {trend && (
            <span className={`tapid-stat-card__trend ${trendUp ? 'tapid-stat-card__trend--up' : 'tapid-stat-card__trend--down'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtitle && <span className="tapid-stat-card__subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
