import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DonutChart from '../DonutChart.jsx';

describe('DonutChart', () => {
  it('shows the empty state when there is no data', () => {
    render(<DonutChart data={[]} />);
    expect(screen.getByText('No status data')).toBeInTheDocument();
  });

  it('shows the empty state when all values are zero', () => {
    render(<DonutChart data={[{ label: 'Pending', value: 0, color: '#f59e0b' }]} />);
    expect(screen.getByText('No status data')).toBeInTheDocument();
  });

  it('renders the combined total and each legend entry', () => {
    const data = [
      { label: 'Pending', value: 2, color: '#f59e0b' },
      { label: 'In Progress', value: 1, color: '#3b82f6' },
      { label: 'Completed', value: 1, color: '#10b981' },
    ];
    render(<DonutChart data={data} />);

    expect(screen.getByText('4')).toBeInTheDocument(); // total
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument(); // Pending's share of the total
  });
});
