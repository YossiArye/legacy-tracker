// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import FilterBar from '../FilterBar.jsx';

// Same shape App.jsx passes for the status filter - this doubles as the
// first regression coverage the status filter has ever had.
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

afterEach(() => {
  cleanup();
});

describe('FilterBar', () => {
  it('renders one button per option', () => {
    render(<FilterBar options={STATUS_OPTIONS} value="all" onChange={() => {}} />);
    for (const option of STATUS_OPTIONS) {
      expect(screen.getByText(option.label)).toBeTruthy();
    }
  });

  it('marks the button matching the current value as active', () => {
    render(<FilterBar options={STATUS_OPTIONS} value="active" onChange={() => {}} />);
    expect(screen.getByText('Active').className).toContain('active');
    expect(screen.getByText('All').className).not.toContain('active');
  });

  it('calls onChange with the clicked option value', () => {
    const onChange = vi.fn();
    render(<FilterBar options={STATUS_OPTIONS} value="all" onChange={onChange} />);
    screen.getByText('Completed').click();
    expect(onChange).toHaveBeenCalledWith('completed');
  });
});
