import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from 'lucide-react';
import SkeletonLoader from '../Loader/SkeletonLoader';
import './Tables.css';

/**
 * Reusable, feature-rich Data Table component
 */
export function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = null,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No records found.',
  actions = null,
  className = '',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const effectiveKeys = searchKeys || columns.map((col) => col.key);

    return data.filter((item) =>
      effectiveKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchKeys, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`tapid-datatable-wrapper glass-panel ${className}`}>
      {searchable && (
        <div className="tapid-datatable__toolbar">
          <div className="tapid-datatable__search">
            <Search size={18} className="tapid-datatable__search-icon" />
            <input
              type="text"
              className="tapid-datatable__search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="tapid-datatable__count">
            Total: <span>{sortedData.length}</span>
          </div>
        </div>
      )}

      <div className="tapid-datatable__table-container">
        <table className="tapid-datatable__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`tapid-datatable__th ${col.sortable ? 'tapid-datatable__th--sortable' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="tapid-datatable__th-content">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <ArrowUpDown
                        size={14}
                        className={`tapid-datatable__sort-icon ${sortKey === col.key ? 'tapid-datatable__sort-icon--active' : ''}`}
                      />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="tapid-datatable__th tapid-datatable__th--actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="tapid-datatable__td-loading">
                  <SkeletonLoader lines={pageSize > 5 ? 5 : pageSize} />
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="tapid-datatable__tr">
                  {columns.map((col) => (
                    <td key={col.key} className="tapid-datatable__td">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && <td className="tapid-datatable__td tapid-datatable__td--actions">{actions(row)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="tapid-datatable__td-empty">
                  <Inbox size={40} className="tapid-datatable__empty-icon" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="tapid-datatable__pagination">
          <span className="tapid-datatable__page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="tapid-datatable__page-controls">
            <button
              className="tapid-datatable__page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="tapid-datatable__page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
