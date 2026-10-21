import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CourseCard } from '../components/CourseCard';

describe('Unit 5 Experiment 1: Course Enrollment & Duplicate Handling Tests', () => {
  const sampleCourse = {
    id: 'cs102',
    title: 'Database Management Systems & SQL',
    category: 'Database',
    difficulty: 'Intermediate',
    instructor: 'Prof. Rajesh Kumar',
    duration: '5 Weeks',
    rating: 4.7,
    thumbnail: 'https://example.com/db.jpg',
    description: 'Relational database schema modeling, indexing, and ACID transactions.'
  };

  it('triggers course enrollment when student clicks Enroll Now', async () => {
    const handleEnroll = vi.fn();
    const user = userEvent.setup();

    render(
      <CourseCard
        course={sampleCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={handleEnroll}
        isEnrolling={false}
      />
    );

    const enrollBtn = screen.getByRole('button', { name: /enroll now/i });
    expect(enrollBtn).toBeInTheDocument();
    expect(enrollBtn).not.toBeDisabled();

    await user.click(enrollBtn);

    expect(handleEnroll).toHaveBeenCalledTimes(1);
    expect(handleEnroll).toHaveBeenCalledWith('cs102');
  });

  it('handles enrolling state during asynchronous operation', () => {
    render(
      <CourseCard
        course={sampleCourse}
        isEnrolled={false}
        onSelectCourse={vi.fn()}
        onEnroll={vi.fn()}
        isEnrolling={true}
      />
    );

    const enrollingBtn = screen.getByRole('button', { name: /enrolling\.\.\./i });
    expect(enrollingBtn).toBeInTheDocument();
    expect(enrollingBtn).toBeDisabled();
  });

  it('prevents duplicate enrollment by displaying Enrolled indicator instead of Enroll button', () => {
    const handleEnroll = vi.fn();

    render(
      <CourseCard
        course={sampleCourse}
        isEnrolled={true}
        onSelectCourse={vi.fn()}
        onEnroll={handleEnroll}
        isEnrolling={false}
      />
    );

    // Enroll button must not exist
    expect(screen.queryByRole('button', { name: /enroll now/i })).not.toBeInTheDocument();

    // Enrolled confirmation indicator should be displayed
    const enrolledIndicator = screen.getByText(/enrolled/i);
    expect(enrolledIndicator).toBeInTheDocument();
  });
});
