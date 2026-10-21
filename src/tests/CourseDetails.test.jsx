import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CourseDetailsModal } from '../components/CourseDetailsModal';

const mockCourse = {
  id: 'cs101',
  title: 'Full Stack Modern Web Development',
  category: 'Web Development',
  difficulty: 'Beginner',
  instructor: 'Dr. Jane Smith',
  duration: '6 Weeks',
  rating: 4.8,
  thumbnail: 'https://example.com/test.jpg',
  description: 'Deep dive into component architecture, hooks, and REST APIs.',
  materials: [
    { id: 'm1', title: 'Module 1: Components and JSX', type: 'PDF Notes', duration: '15 mins' },
    { id: 'm2', title: 'Module 2: State and Props Deep Dive', type: 'Video Lecture', duration: '35 mins' }
  ],
  quizzes: [
    { id: 'q1', question: 'What hook handles side effects in React?' }
  ],
  assignments: [
    { id: 'a1', title: 'Build a Product Catalog' }
  ]
};

describe('Unit 5 Experiment 1: CourseDetails Component Tests', () => {
  it('renders loading state when loading is true', () => {
    render(
      <CourseDetailsModal
        course={null}
        loading={true}
        error={null}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/fetching dynamic course details/i)).toBeInTheDocument();
  });

  it('renders error state and retry button when error occurs', async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseDetailsModal
        course={null}
        loading={false}
        error="Failed to load course details."
        onClose={vi.fn()}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Failed to load course details.')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry fetching details/i });
    expect(retryBtn).toBeInTheDocument();

    await user.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders complete course syllabus, learning materials, and assessments', () => {
    render(
      <CourseDetailsModal
        course={mockCourse}
        loading={false}
        error={null}
        onClose={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolled={false}
        isEnrolling={false}
      />
    );

    // Title & Description
    expect(screen.getByText('Full Stack Modern Web Development')).toBeInTheDocument();
    expect(screen.getByText(/Deep dive into component architecture/i)).toBeInTheDocument();

    // Instructor and duration
    expect(screen.getByText(/Dr. Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/6 Weeks/i)).toBeInTheDocument();

    // Syllabus modules
    expect(screen.getByText('Module 1: Components and JSX')).toBeInTheDocument();
    expect(screen.getByText('Module 2: State and Props Deep Dive')).toBeInTheDocument();

    // Assessments counter chips
    expect(screen.getByText(/Interactive Quizzes/i)).toBeInTheDocument();
    expect(screen.getByText(/Practical Assignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Course Completion Certificate Included/i)).toBeInTheDocument();
  });

  it('allows student to enroll in course from details modal', async () => {
    const handleEnroll = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseDetailsModal
        course={mockCourse}
        loading={false}
        error={null}
        onClose={vi.fn()}
        onEnroll={handleEnroll}
        isEnrolled={false}
        isEnrolling={false}
      />
    );

    const enrollBtn = screen.getByRole('button', { name: /enroll in this course/i });
    await user.click(enrollBtn);

    expect(handleEnroll).toHaveBeenCalledTimes(1);
    expect(handleEnroll).toHaveBeenCalledWith('cs101');
  });

  it('shows dashboard navigation link when student is already enrolled', async () => {
    const handleGoToDashboard = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseDetailsModal
        course={mockCourse}
        loading={false}
        error={null}
        onClose={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolled={true}
        onGoToDashboard={handleGoToDashboard}
      />
    );

    expect(screen.getByText(/you are enrolled in this course!/i)).toBeInTheDocument();
    const dashboardBtn = screen.getByRole('button', { name: /open in dashboard/i });
    await user.click(dashboardBtn);

    expect(handleGoToDashboard).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseDetailsModal
        course={mockCourse}
        loading={false}
        error={null}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
