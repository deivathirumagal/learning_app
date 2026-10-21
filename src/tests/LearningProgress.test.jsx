import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Component rendering progress tracking display
const ProgressTracker = ({
  completedMaterialsCount = 0,
  totalMaterialsCount = 3,
  submittedQuizzesCount = 0,
  totalQuizzesCount = 2,
  submittedAssignmentsCount = 0,
  totalAssignmentsCount = 1,
  onCompleteMaterial
}) => {
  // Weighted formula: materials 50%, quizzes 25%, assignments 25%
  const matRatio = totalMaterialsCount > 0 ? (completedMaterialsCount / totalMaterialsCount) * 50 : 0;
  const quizRatio = totalQuizzesCount > 0 ? (submittedQuizzesCount / totalQuizzesCount) * 25 : 0;
  const assignRatio = totalAssignmentsCount > 0 ? (submittedAssignmentsCount / totalAssignmentsCount) * 25 : 0;
  const totalProgress = Math.min(100, Math.round(matRatio + quizRatio + assignRatio));

  return (
    <div className="progress-analytics-card" data-testid="progress-tracker">
      <div className="summary-section">
        <span className="summary-title">Total Weighted Course Progress</span>
        <h2 className="summary-percentage" data-testid="progress-percent-value">{totalProgress}%</h2>
      </div>

      <div className="progress-track" aria-label="Course completion progress">
        <div 
          className="progress-fill" 
          style={{ width: `${totalProgress}%` }}
          data-testid="progress-fill-bar"
        ></div>
      </div>

      <div className="milestones-list">
        <div data-testid="milestone-materials">
          <span>Materials: {completedMaterialsCount}/{totalMaterialsCount}</span>
          <button 
            type="button" 
            onClick={() => onCompleteMaterial && onCompleteMaterial('m1')}
          >
            Mark Module 1 Complete
          </button>
        </div>
        <div data-testid="milestone-quizzes">
          <span>Quizzes: {submittedQuizzesCount}/{totalQuizzesCount}</span>
        </div>
        <div data-testid="milestone-assignments">
          <span>Assignments: {submittedAssignmentsCount}/{totalAssignmentsCount}</span>
        </div>
      </div>

      {totalProgress >= 100 && (
        <div data-testid="certificate-unlocked">
          <span>Course Completed! Certificate Unlocked</span>
        </div>
      )}
    </div>
  );
};

describe('Unit 5 Experiment 1: Learning Progress Updates & Milestone Tests', () => {
  it('calculates initial zero progress accurately', () => {
    render(
      <ProgressTracker
        completedMaterialsCount={0}
        totalMaterialsCount={3}
        submittedQuizzesCount={0}
        totalQuizzesCount={2}
        submittedAssignmentsCount={0}
        totalAssignmentsCount={1}
      />
    );

    expect(screen.getByTestId('progress-percent-value')).toHaveTextContent('0%');
    expect(screen.getByTestId('progress-fill-bar')).toHaveStyle({ width: '0%' });
    expect(screen.queryByTestId('certificate-unlocked')).not.toBeInTheDocument();
  });

  it('updates progress calculation when materials are completed', async () => {
    const handleComplete = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ProgressTracker
        completedMaterialsCount={0}
        totalMaterialsCount={3}
        submittedQuizzesCount={0}
        totalQuizzesCount={2}
        submittedAssignmentsCount={0}
        totalAssignmentsCount={1}
        onCompleteMaterial={handleComplete}
      />
    );

    const completeBtn = screen.getByRole('button', { name: /mark module 1 complete/i });
    await user.click(completeBtn);
    expect(handleComplete).toHaveBeenCalledWith('m1');

    // Rerender with 1 of 3 materials completed (~17%)
    rerender(
      <ProgressTracker
        completedMaterialsCount={1}
        totalMaterialsCount={3}
        submittedQuizzesCount={0}
        totalQuizzesCount={2}
        submittedAssignmentsCount={0}
        totalAssignmentsCount={1}
      />
    );

    expect(screen.getByTestId('progress-percent-value')).toHaveTextContent('17%');
    expect(screen.getByTestId('progress-fill-bar')).toHaveStyle({ width: '17%' });
  });

  it('reflects 100% progress and displays certificate completion when all milestones are achieved', () => {
    render(
      <ProgressTracker
        completedMaterialsCount={3}
        totalMaterialsCount={3}
        submittedQuizzesCount={2}
        totalQuizzesCount={2}
        submittedAssignmentsCount={1}
        totalAssignmentsCount={1}
      />
    );

    expect(screen.getByTestId('progress-percent-value')).toHaveTextContent('100%');
    expect(screen.getByTestId('progress-fill-bar')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('certificate-unlocked')).toBeInTheDocument();
  });
});
