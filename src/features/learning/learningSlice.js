import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { courseApiService } from '../../services/courseApi';

// Load initial learning state from localStorage for persistence requirement
const loadPersistedEnrollments = () => {
  try {
    const raw = localStorage.getItem('elearn_enrollments_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Async Thunks
export const fetchLearningHistoryAsync = createAsyncThunk(
  'learning/fetchHistory',
  async ({ email, token }, { rejectWithValue }) => {
    try {
      const history = await courseApiService.getLearningHistory(email, token);
      return history;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status || 500
      });
    }
  }
);

export const enrollCourseAsync = createAsyncThunk(
  'learning/enrollCourse',
  async ({ courseId, studentInfo, token }, { rejectWithValue }) => {
    try {
      const record = await courseApiService.enrollCourse(courseId, studentInfo, token);
      return record;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status || 500
      });
    }
  }
);

export const updateProgressAsync = createAsyncThunk(
  'learning/updateProgress',
  async ({ enrollmentId, progressPercentage, completedMaterialId, token }, { rejectWithValue }) => {
    try {
      const updated = await courseApiService.updateProgress(
        enrollmentId,
        { progressPercentage, completedMaterialId },
        token
      );
      return updated;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status || 500
      });
    }
  }
);

export const submitQuizAsync = createAsyncThunk(
  'learning/submitQuiz',
  async ({ enrollmentId, quizId, score, answers, token }, { rejectWithValue }) => {
    try {
      const updated = await courseApiService.submitQuizScore(
        enrollmentId,
        quizId,
        score,
        answers,
        token
      );
      return updated;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status || 500
      });
    }
  }
);

export const submitAssignmentAsync = createAsyncThunk(
  'learning/submitAssignment',
  async ({ enrollmentId, assignmentId, submissionText, token }, { rejectWithValue }) => {
    try {
      const updated = await courseApiService.submitAssignment(
        enrollmentId,
        assignmentId,
        submissionText,
        token
      );
      return updated;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status || 500
      });
    }
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState: {
    enrollments: loadPersistedEnrollments(),
    loading: false,
    operationLoading: false,
    error: null,
    successMessage: null,
    lastActionInfo: null
  },
  reducers: {
    clearLearningMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetLearningState: (state) => {
      state.enrollments = [];
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Learning History
      .addCase(fetchLearningHistoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningHistoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchLearningHistoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load enrolled courses.';
      })
      // Enroll Course
      .addCase(enrollCourseAsync.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(enrollCourseAsync.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.enrollments.push(action.payload);
        state.successMessage = `Successfully enrolled in "${action.payload.courseTitle}"!`;
        state.lastActionInfo = { type: 'ENROLL', id: action.payload.enrollmentId };
      })
      .addCase(enrollCourseAsync.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload?.message || 'Enrollment failed.';
      })
      // Update Progress
      .addCase(updateProgressAsync.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateProgressAsync.fulfilled, (state, action) => {
        state.operationLoading = false;
        const idx = state.enrollments.findIndex(e => e.enrollmentId === action.payload.enrollmentId);
        if (idx !== -1) {
          state.enrollments[idx] = action.payload;
        }
        state.successMessage = `Progress updated to ${action.payload.progressPercentage}%!`;
      })
      .addCase(updateProgressAsync.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload?.message || 'Failed to update progress.';
      })
      // Submit Quiz
      .addCase(submitQuizAsync.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(submitQuizAsync.fulfilled, (state, action) => {
        state.operationLoading = false;
        const idx = state.enrollments.findIndex(e => e.enrollmentId === action.payload.enrollmentId);
        if (idx !== -1) {
          state.enrollments[idx] = action.payload;
        }
        state.successMessage = "Quiz submitted successfully! Score recorded.";
      })
      .addCase(submitQuizAsync.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload?.message || 'Failed to submit quiz.';
      })
      // Submit Assignment
      .addCase(submitAssignmentAsync.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(submitAssignmentAsync.fulfilled, (state, action) => {
        state.operationLoading = false;
        const idx = state.enrollments.findIndex(e => e.enrollmentId === action.payload.enrollmentId);
        if (idx !== -1) {
          state.enrollments[idx] = action.payload;
        }
        state.successMessage = "Assignment uploaded and graded successfully!";
      })
      .addCase(submitAssignmentAsync.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload?.message || 'Failed to submit assignment.';
      });
  }
});

export const { clearLearningMessages, resetLearningState } = learningSlice.actions;
export default learningSlice.reducer;
