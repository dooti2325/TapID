import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import Badge from '../src/components/Badge/Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    const { container } = render(
      <Badge variant="success" size="lg">
        Present
      </Badge>
    );
    const badge = container.querySelector('.tapid-badge');
    expect(badge).toHaveClass('tapid-badge--success');
    expect(badge).toHaveClass('tapid-badge--lg');
  });

  it('renders status dot when dot prop is true', () => {
    const { container } = render(
      <Badge variant="danger" dot>
        Absent
      </Badge>
    );
    const dot = container.querySelector('.tapid-badge__dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('tapid-badge__dot--danger');
  });
});
