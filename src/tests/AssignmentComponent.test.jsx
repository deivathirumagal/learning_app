import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AssignmentComponent } from '../components/AssignmentComponent';

const mockAssignments = [
  {
    id: 'a1',
    title: 'Build a Filterable Product Catalog',
    deadline: 'End of Week 2',
    maxMarks: 100
  }
];

describe('Unit 5 Experiment 1: AssignmentComponent Tests', () => {
  it('renders assignment title, max marks badge, and submission form', () => {
    render(
      <AssignmentComponent
        assignments={mockAssignments}
        submittedAssignments={{}}
        onSubmitAssignment={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('Build a Filterable Product Catalog')).toBeInTheDocument();
    expect(screen.getByText(/Max Marks: 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Deadline: End of Week 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit assignment/i })).toBeInTheDocument();
  });

  it('validates empty submission attempt and displays error message', async () => {
    const handleSubmitAssignment = vi.fn();
    const user = userEvent.setup();

    render(
      <AssignmentComponent
        assignments={mockAssignments}
        submittedAssignments={{}}
        onSubmitAssignment={handleSubmitAssignment}
        isSubmitting={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit assignment/i });
    await user.click(submitBtn);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/please provide your assignment response or repository URL/i)).toBeInTheDocument();
    expect(handleSubmitAssignment).not.toHaveBeenCalled();
  });

  it('submits valid solution text and calls onSubmitAssignment', async () => {
    const handleSubmitAssignment = vi.fn();
    const user = userEvent.setup();

    render(
      <AssignmentComponent
        assignments={mockAssignments}
        submittedAssignments={{}}
        onSubmitAssignment={handleSubmitAssignment}
        isSubmitting={false}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /solution for build a filterable product catalog/i });
    await user.type(textarea, 'https://github.com/student/unit4-assignment-solution');

    const submitBtn = screen.getByRole('button', { name: /submit assignment/i });
    await user.click(submitBtn);

    expect(handleSubmitAssignment).toHaveBeenCalledTimes(1);
    expect(handleSubmitAssignment).toHaveBeenCalledWith('a1', 'https://github.com/student/unit4-assignment-solution');
  });

  it('renders submitted grade feedback when assignment is already submitted', () => {
    const submittedData = {
      a1: {
        content: 'https://github.com/student/unit4-completed',
        grade: 'A+ (98/100)',
        status: 'Evaluated',
        submittedAt: new Date().toISOString()
      }
    };

    render(
      <AssignmentComponent
        assignments={mockAssignments}
        submittedAssignments={submittedData}
        onSubmitAssignment={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/Grade: A\+ \(98\/100\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: Evaluated/i)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/github\.com\/student\/unit4-completed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit assignment/i })).not.toBeInTheDocument();
  });
});
