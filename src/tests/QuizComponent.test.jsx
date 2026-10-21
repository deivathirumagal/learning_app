import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuizComponent } from '../components/QuizComponent';

const mockQuizzes = [
  {
    id: 'q1',
    question: 'What hook is primarily used for handling side effects in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    answer: 'useEffect'
  },
  {
    id: 'q2',
    question: 'In React, data flows in which direction?',
    options: ['Bidirectional', 'Unidirectional (Top to bottom)', 'Bottom to top', 'Random'],
    answer: 'Unidirectional (Top to bottom)'
  }
];

describe('Unit 5 Experiment 1: QuizComponent Tests', () => {
  it('renders all quiz questions and options accurately', () => {
    render(
      <QuizComponent
        quizzes={mockQuizzes}
        quizScores={{}}
        onSubmitQuiz={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('What hook is primarily used for handling side effects in React?')).toBeInTheDocument();
    expect(screen.getByText('useEffect')).toBeInTheDocument();

    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('In React, data flows in which direction?')).toBeInTheDocument();
    expect(screen.getByText('Unidirectional (Top to bottom)')).toBeInTheDocument();
  });

  it('validates incomplete selection and alerts the user', async () => {
    const handleSubmitQuiz = vi.fn();
    const user = userEvent.setup();

    render(
      <QuizComponent
        quizzes={mockQuizzes}
        quizScores={{}}
        onSubmitQuiz={handleSubmitQuiz}
        isSubmitting={false}
      />
    );

    // Click Submit Quiz without selecting an option
    const submitButtons = screen.getAllByRole('button', { name: /submit quiz/i });
    await user.click(submitButtons[0]);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/please select an answer/i)).toBeInTheDocument();
    expect(handleSubmitQuiz).not.toHaveBeenCalled();
  });

  it('selects option and triggers onSubmitQuiz on submission', async () => {
    const handleSubmitQuiz = vi.fn();
    const user = userEvent.setup();

    render(
      <QuizComponent
        quizzes={mockQuizzes}
        quizScores={{}}
        onSubmitQuiz={handleSubmitQuiz}
        isSubmitting={false}
      />
    );

    const radioOption = screen.getByLabelText(/What hook is primarily used for handling side effects in React\?: useEffect/i);
    await user.click(radioOption);
    expect(radioOption).toBeChecked();

    const submitButtons = screen.getAllByRole('button', { name: /submit quiz/i });
    await user.click(submitButtons[0]);

    expect(handleSubmitQuiz).toHaveBeenCalledTimes(1);
    expect(handleSubmitQuiz).toHaveBeenCalledWith(mockQuizzes[0], 'useEffect');
  });

  it('displays recorded score badge and prevents re-answering when already submitted', () => {
    const existingScores = {
      q1: { score: 100, submittedAt: new Date().toISOString() }
    };

    render(
      <QuizComponent
        quizzes={mockQuizzes}
        quizScores={existingScores}
        onSubmitQuiz={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/Score: 100\/100 \(Submitted\)/i)).toBeInTheDocument();
    expect(screen.getByText(/this quiz has been submitted and recorded/i)).toBeInTheDocument();

    const radioOption = screen.getByLabelText(/What hook is primarily used for handling side effects in React\?: useEffect/i);
    expect(radioOption).toBeDisabled();
  });
});
