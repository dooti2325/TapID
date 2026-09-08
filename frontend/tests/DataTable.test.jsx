import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import DataTable from '../src/components/Tables/DataTable';

describe('DataTable Component', () => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'enrollment', label: 'Enrollment', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const data = [
    { id: 1, name: 'John Doe', enrollment: 'EN001', status: 'present' },
    { id: 2, name: 'Jane Roe', enrollment: 'EN002', status: 'absent' },
    { id: 3, name: 'Sam Smith', enrollment: 'EN003', status: 'late' },
  ];

  it('renders table headers and rows correctly', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Roe')).toBeInTheDocument();
  });

  it('filters data based on search input', () => {
    render(<DataTable columns={columns} data={data} searchPlaceholder="Search..." />);
    const searchInput = screen.getByPlaceholderText('Search...');

    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.getByText('Jane Roe')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows empty message when no records match', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search..."
        emptyMessage="No students found."
      />
    );
    const searchInput = screen.getByPlaceholderText('Search...');

    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    expect(screen.getByText('No students found.')).toBeInTheDocument();
  });
});
