import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProjectModal from '../ProjectModal.jsx';

describe('ProjectModal', () => {
  it('does not render anything when isOpen is false', () => {
    const { container } = render(<ProjectModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('blocks submit and shows a validation error when the name is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProjectModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    expect(await screen.findByText('Project name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('previews the derived Jira-style ticket key as the name is typed', async () => {
    const user = userEvent.setup();
    render(<ProjectModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('e.g. Website Redesign'), 'Nexus Launch');

    expect(screen.getByText('NEXUSL-1')).toBeInTheDocument();
    expect(screen.getByText('NEXUSL-2')).toBeInTheDocument();
  });

  it('submits the trimmed name and description', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProjectModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('e.g. Website Redesign'), '  Marketing Site  ');
    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Marketing Site', color: expect.any(String) })
    );
  });
});
