import React from 'react';
import './Charts.css';

/**
 * Modern SVG/CSS Bar Chart for weekly or periodic attendance rate visualization
 *
 * @param {object} props
 * @param {Array<{ label: string, value: number, present?: number, total?: number }>} props.data
 * @param {string} [props.title] - Optional title
 * @param {string} [props.unit='%'] - Unit label
 */
export function AttendanceBarChart({ data = [], title, unit = '%' }) {
  const maxVal = Math.max(...data.map((d) => d.value), 100);

  return (
    <div className="tapid-chart-card glass-panel">
      {title && <h4 className="tapid-chart-card__title">{title}</h4>}

      <div className="tapid-barchart">
        <div className="tapid-barchart__grid">
          {data.map((item, index) => {
            const heightPercent = Math.min(Math.max((item.value / maxVal) * 100, 4), 100);

            return (
              <div key={index} className="tapid-barchart__col">
                <div className="tapid-barchart__bar-container">
                  <div className="tapid-barchart__tooltip">
                    <span className="font-semibold">{item.label}</span>
                    <span>
                      {item.value}
                      {unit}
                    </span>
                    {item.present !== undefined && item.total !== undefined && (
                      <span className="text-xs text-gray-400">
                        ({item.present}/{item.total})
                      </span>
                    )}
                  </div>
                  <div
                    className="tapid-barchart__bar"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="tapid-barchart__label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AttendanceBarChart;
