import React from 'react';
import './Charts.css';

/**
 * Lightweight SVG Donut Chart for attendance distribution (Present vs Absent vs Late)
 *
 * @param {object} props
 * @param {Array<{ label: string, value: number, color: string }>} props.segments
 * @param {string} [props.title]
 * @param {string} [props.centerLabel]
 * @param {string|number} [props.centerValue]
 */
export function DonutChart({
  segments = [],
  title,
  centerLabel = 'Total',
  centerValue,
}) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);
  const effectiveCenterValue = centerValue !== undefined ? centerValue : total;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="tapid-chart-card glass-panel">
      {title && <h4 className="tapid-chart-card__title">{title}</h4>}

      <div className="tapid-donut-container">
        <div className="tapid-donut__svg-wrapper">
          <svg className="tapid-donut__svg" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              className="tapid-donut__bg"
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="12"
            />

            {/* Segments */}
            {total > 0 &&
              segments.map((seg, idx) => {
                const strokeDasharray = (seg.value / total) * circumference;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += strokeDasharray;

                return (
                  <circle
                    key={idx}
                    className="tapid-donut__segment"
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
          </svg>

          <div className="tapid-donut__center">
            <span className="tapid-donut__center-value">{effectiveCenterValue}</span>
            <span className="tapid-donut__center-label">{centerLabel}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="tapid-donut__legend">
          {segments.map((seg, idx) => (
            <div key={idx} className="tapid-donut__legend-item">
              <span
                className="tapid-donut__legend-dot"
                style={{ backgroundColor: seg.color }}
              />
              <span className="tapid-donut__legend-name">{seg.label}:</span>
              <span className="tapid-donut__legend-val">{seg.value}</span>
              {total > 0 && (
                <span className="tapid-donut__legend-percent">
                  ({Math.round((seg.value / total) * 100)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
