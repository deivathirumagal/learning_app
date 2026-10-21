import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export const QuizComponent = ({
  quizzes = [],
  quizScores = {},
  onSubmitQuiz,
  isSubmitting = false
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectOption = (quizId, option) => {
    setSelectedAnswers(prev => ({ ...prev, [quizId]: option }));
    if (errorMsg) setErrorMsg('');
  };

  const handleFormSubmit = (quiz) => {
    const selectedAnswer = selectedAnswers[quiz.id];
    if (!selectedAnswer) {
      setErrorMsg(`Please select an answer for ${quiz.question}`);
      return;
    }

    if (onSubmitQuiz) {
      onSubmitQuiz(quiz, selectedAnswer);
    }
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="empty-box" data-testid="no-quizzes">
        <p>No assessment quizzes available for this course.</p>
      </div>
    );
  }

  return (
    <div className="quizzes-container" data-testid="quiz-container">
      {errorMsg && (
        <div 
          className="error-box" 
          role="alert" 
          style={{ padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}
        >
          {errorMsg}
        </div>
      )}

      {quizzes.map((q, idx) => {
        const existingScore = quizScores?.[q.id];
        const isCurrentSelected = selectedAnswers[q.id];

        return (
          <div key={q.id} className="quiz-card-box" data-testid={`quiz-card-${q.id}`}>
            <div className="quiz-header">
              <span className="quiz-q-num">Question {idx + 1}</span>
              {existingScore && (
                <span className="quiz-score-badge">
                  Score: {existingScore.score}/100 (Submitted)
                </span>
              )}
            </div>

            <h4 className="quiz-question-text">{q.question}</h4>

            <div className="quiz-options-list">
              {q.options?.map((opt) => (
                <label 
                  key={opt} 
                  className={`quiz-option-label ${isCurrentSelected === opt ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`quiz_${q.id}`}
                    value={opt}
                    checked={isCurrentSelected === opt}
                    onChange={() => handleSelectOption(q.id, opt)}
                    disabled={!!existingScore}
                    aria-label={`${q.question}: ${opt}`}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {!existingScore ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                onClick={() => handleFormSubmit(q)}
                style={{ marginTop: '0.75rem' }}
              >
                {isSubmitting ? 'Submitting Score...' : 'Submit Quiz'}
              </button>
            ) : (
              <div className="quiz-submitted-notice">
                <CheckCircle size={15} color="#10b981" /> This quiz has been submitted and recorded.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
