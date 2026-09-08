import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StatCard from '../src/components/Cards/StatCard';

describe('StatCard Component', () => {
  it('renders title, value, and subtitle', () => {
    render(
      <StatCard
        title="Total Students"
        value={120}
        subtitle="Enrolled this term"
        trend="8%"
        trendUp={true}
      />
    );
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Enrolled this term')).toBeInTheDocument();
    expect(screen.getByText(/8%/)).toBeInTheDocument();
  });

  it('renders skeleton in loading state', () => {
    const { container } = render(
      <StatCard title="Active Sessions" value={4} loading={true} />
    );
    expect(container.querySelector('.tapid-stat-card__skeleton')).toBeInTheDocument();
  });
});
