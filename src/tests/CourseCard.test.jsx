import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CourseCard } from '../components/CourseCard';

const mockCourse = {
  id: 'cs101',
  title: 'Full Stack Modern Web Development',
  category: 'Web Development',
  difficulty: 'Beginner',
  instructor: 'Dr. Jane Smith',
  duration: '6 Weeks',
  rating: 4.8,
  thumbnail: 'https://example.com/test.jpg',
  description: 'Master React component testing, states, and hooks.'
};

describe('Unit 5 Experiment 1: CourseCard Component Tests', () => {
  it('renders course information, badge, category, and metadata accurately', () => {
    render(
      <CourseCard
        course={mockCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolling={false}
        onDeleteCourse={vi.fn()}
        isDeleting={false}
        onEditCourse={vi.fn()}
      />
    );

    // Verify Title & Description
    expect(screen.getByText('Full Stack Modern Web Development')).toBeInTheDocument();
    expect(screen.getByText(/Master React component testing/i)).toBeInTheDocument();

    // Verify Category, Difficulty, Instructor, Duration, Rating
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('6 Weeks')).toBeInTheDocument();
    expect(screen.getByText(/4.8/)).toBeInTheDocument();

    // Verify Action buttons
    expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enroll now/i })).toBeInTheDocument();
  });

  it('triggers onSelectCourse when Details button is clicked', async () => {
    const handleSelectCourse = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseCard
        course={mockCourse}
        isEnrolled={false}
        onSelectCourse={handleSelectCourse}
        onEnroll={vi.fn()}
        isEnrolling={false}
        onDeleteCourse={vi.fn()}
        isDeleting={false}
        onEditCourse={vi.fn()}
      />
    );

    const detailsBtn = screen.getByRole('button', { name: /details/i });
    await user.click(detailsBtn);

    expect(handleSelectCourse).toHaveBeenCalledTimes(1);
    expect(handleSelectCourse).toHaveBeenCalledWith('cs101');
  });

  it('triggers onEditCourse when Edit button is clicked', async () => {
    const handleEditCourse = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseCard
        course={mockCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolling={false}
        onDeleteCourse={vi.fn()}
        isDeleting={false}
        onEditCourse={handleEditCourse}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit/i });
    await user.click(editBtn);

    expect(handleEditCourse).toHaveBeenCalledTimes(1);
    expect(handleEditCourse).toHaveBeenCalledWith(mockCourse);
  });

  it('triggers onDeleteCourse when Delete button is clicked', async () => {
    const handleDeleteCourse = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseCard
        course={mockCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolling={false}
        onDeleteCourse={handleDeleteCourse}
        isDeleting={false}
        onEditCourse={vi.fn()}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteBtn);

    expect(handleDeleteCourse).toHaveBeenCalledTimes(1);
    expect(handleDeleteCourse).toHaveBeenCalledWith('cs101', 'Full Stack Modern Web Development');
  });

  it('triggers onEnroll when Enroll Now button is clicked and shows Enrolled badge when enrolled', async () => {
    const handleEnroll = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <CourseCard
        course={mockCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={handleEnroll}
        isEnrolling={false}
        onDeleteCourse={vi.fn()}
        isDeleting={false}
        onEditCourse={vi.fn()}
      />
    );

    const enrollBtn = screen.getByRole('button', { name: /enroll now/i });
    await user.click(enrollBtn);

    expect(handleEnroll).toHaveBeenCalledTimes(1);
    expect(handleEnroll).toHaveBeenCalledWith('cs101');

    // Rerender as already enrolled
    rerender(
      <CourseCard
        course={mockCourse}
        isEnrolled={true}
        onSelectCourse={vi.fn()}
        onEnroll={handleEnroll}
        isEnrolling={false}
        onDeleteCourse={vi.fn()}
        isDeleting={false}
        onEditCourse={vi.fn()}
      />
    );

    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enroll now/i })).not.toBeInTheDocument();
  });
});
