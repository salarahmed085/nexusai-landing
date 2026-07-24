import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../TaskCard.jsx';

const baseTask = {
  id: '1',
  title: 'Ship the dashboard',
  description: 'Finish the analytics charts',
  status: 'In Progress',
  priority: 'High',
  createdAt: '2026-01-05T10:00:00.000Z',
};

describe('TaskCard', () => {
  it('renders the task title, description, status and priority', () => {
    render(<TaskCard task={baseTask} index={0} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Ship the dashboard')).toBeInTheDocument();
    expect(screen.getByText('Finish the analytics charts')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('does not render an attachment link when the task has no attachment', () => {
    render(<TaskCard task={baseTask} index={0} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText('Attachment')).not.toBeInTheDocument();
  });

  it('renders an attachment link when the task has one', () => {
    const taskWithAttachment = { ...baseTask, attachmentPath: '/uploads/file.pdf', attachmentName: 'spec.pdf' };
    render(<TaskCard task={taskWithAttachment} index={0} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Attachment')).toBeInTheDocument();
  });

  it('shows the Jira-style ticket key badge when the task belongs to a project', () => {
    const ticket = { ...baseTask, ticketKey: 'PROJ-1' };
    render(<TaskCard task={ticket} index={0} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('PROJ-1')).toBeInTheDocument();
  });
});
