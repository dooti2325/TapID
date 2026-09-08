import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  timeAgo,
  capitalize,
  formatEnrollment,
} from '../src/utils/formatters';

describe('formatters utility', () => {
  it('formats date cleanly', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    const formatted = formatDate('2026-09-08T10:30:00Z');
    expect(formatted).toContain('2026');
  });

  it('formats time cleanly', () => {
    expect(formatTime(null)).toBe('—');
    const formatted = formatTime('2026-09-08T10:30:00Z');
    expect(typeof formatted).toBe('string');
  });

  it('formats date and time combined', () => {
    expect(formatDateTime(null)).toBe('—');
    const formatted = formatDateTime('2026-09-08T10:30:00Z');
    expect(formatted).toContain('2026');
  });

  it('calculates relative timeAgo', () => {
    expect(timeAgo(null)).toBe('—');
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');

    const pastHour = new Date(Date.now() - 3600 * 1000).toISOString();
    expect(timeAgo(pastHour)).toBe('1h ago');
  });

  it('capitalizes strings', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize('present')).toBe('Present');
    expect(capitalize('ADMIN')).toBe('Admin');
  });

  it('formats enrollment numbers cleanly', () => {
    expect(formatEnrollment(null)).toBe('—');
    expect(formatEnrollment('  en2024001  ')).toBe('EN2024001');
  });
});
