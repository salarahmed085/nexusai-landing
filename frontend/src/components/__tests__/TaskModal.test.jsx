import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// TaskAttachment (rendered only in edit mode) needs TaskContext/ToastContext,
// which is out of scope for these form-behavior tests.
vi.mock('../TaskAttachment.jsx', () => ({ default: () => <div data-testid="task-attachment-stub" /> }));

import TaskModal from '../TaskModal.jsx';

describe('TaskModal', () => {
  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <TaskModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a validation error and blocks submit when title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed form values when the title is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('Enter task title...'), '  Ship feature  ');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ship feature', status: 'Pending', priority: 'Medium' })
    );
  });

  it('pre-fills the form with existing task values in edit mode', () => {
    const task = { id: '1', title: 'Existing task', description: 'desc', status: 'Completed', priority: 'Low' };
    render(<TaskModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} task={task} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing task')).toBeInTheDocument();
  });

  it('calls onClose when the close (X) button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TaskModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);

    // The header close (X) button is the first button rendered in the modal.
    await user.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
