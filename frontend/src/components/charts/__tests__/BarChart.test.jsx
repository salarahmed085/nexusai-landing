import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BarChart from '../BarChart.jsx';

describe('BarChart', () => {
  it('shows a fallback message when there is no data', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('No bar chart data available')).toBeInTheDocument();
  });

  it('renders one bar per data entry with its axis label', () => {
    const data = [
      { label: 'Low', value: 2, color: '#60a5fa' },
      { label: 'Medium', value: 5, color: '#8b5cf6' },
      { label: 'High', value: 3, color: '#f87171' },
    ];
    const { container } = render(<BarChart data={data} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    const bars = container.querySelectorAll('rect');
    expect(bars.length).toBe(data.length);
  });

  it('scales the tallest bar to the entry with the highest value', () => {
    const data = [
      { label: 'Low', value: 1, color: '#60a5fa' },
      { label: 'High', value: 10, color: '#f87171' },
    ];
    const { container } = render(<BarChart data={data} />);
    const bars = [...container.querySelectorAll('rect')];

    const lowHeight = Number(bars[0].getAttribute('height'));
    const highHeight = Number(bars[1].getAttribute('height'));
    expect(highHeight).toBeGreaterThan(lowHeight);
  });
});
