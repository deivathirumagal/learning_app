import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { courseApiService } from '../../services/courseApi';

// Async thunk to fetch courses with cache verification
export const fetchCoursesAsync = createAsyncThunk(
  'courses/fetchCourses',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { courses, cacheTimestamp, lastFilters } = state.courses;
      
      const isSameFilter = 
        JSON.stringify(lastFilters) === JSON.stringify(filters);
      
      // Cache valid for 60 seconds if no filter change and no forced failure
      const isCacheValid = 
        isSameFilter && 
        courses.length > 0 && 
        cacheTimestamp && 
        (Date.now() - cacheTimestamp < 60000) &&
        !courseApiService.isSimulatedFailureActive();

      if (isCacheValid) {
        return { courses, fromCache: true, filters };
      }

      const data = await courseApiService.getAllCourses(filters);
      return { courses: data, fromCache: false, filters };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load courses.');
    }
  }
);

// Async thunk to fetch individual course detail
export const fetchCourseDetailAsync = createAsyncThunk(
  'courses/fetchCourseDetail',
  async (courseId, { rejectWithValue }) => {
    try {
      const course = await courseApiService.getCourseById(courseId);
      return course;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to retrieve course details.');
    }
  }
);

// Async thunk to delete course
export const deleteCourseAsync = createAsyncThunk(
  'courses/deleteCourse',
  async ({ courseId, token }, { rejectWithValue }) => {
    try {
      const result = await courseApiService.deleteCourse(courseId, token);
      return { courseId, result };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete course.');
    }
  }
);

// Async thunk to update course
export const updateCourseAsync = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, updatedData, token }, { rejectWithValue }) => {
    try {
      const result = await courseApiService.updateCourse(courseId, updatedData, token);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update course.');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    selectedCourse: null,
    loading: false,
    detailLoading: false,
    deleteLoading: false,
    updateLoading: false,
    error: null,
    detailError: null,
    deleteError: null,
    deleteSuccess: null,
    updateError: null,
    updateSuccess: null,
    isFromCache: false,
    cacheTimestamp: null,
    lastFilters: { search: '', category: 'All', difficulty: 'All' },
    filters: { search: '', category: 'All', difficulty: 'All' }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
      state.detailError = null;
    },
    clearCourseCache: (state) => {
      state.cacheTimestamp = null;
      state.isFromCache = false;
    },
    clearDeleteStatus: (state) => {
      state.deleteError = null;
      state.deleteSuccess = null;
    },
    clearUpdateStatus: (state) => {
      state.updateError = null;
      state.updateSuccess = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.isFromCache = action.payload.fromCache;
        state.lastFilters = action.payload.filters;
        if (!action.payload.fromCache) {
          state.cacheTimestamp = Date.now();
        }
      })
      .addCase(fetchCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch courses.';
        state.isFromCache = false;
      })
      // Fetch Course Detail
      .addCase(fetchCourseDetailAsync.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchCourseDetailAsync.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseDetailAsync.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || 'Failed to fetch course details.';
      })
      // Delete Course
      .addCase(deleteCourseAsync.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteCourseAsync.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const deletedId = action.payload.courseId;
        // Remove deleted course immediately from courses list
        state.courses = state.courses.filter(c => c.id !== deletedId);
        // Clear selectedCourse if it was the one deleted
        if (state.selectedCourse && state.selectedCourse.id === deletedId) {
          state.selectedCourse = null;
        }
        state.cacheTimestamp = null; // Invalidate cache so fresh fetch works
        state.deleteSuccess = action.payload.result?.message || 'Course deleted successfully.';
      })
      .addCase(deleteCourseAsync.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || 'Failed to delete course.';
      })
      // Update Course
      .addCase(updateCourseAsync.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateCourseAsync.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedCourse = action.payload?.course;
        if (updatedCourse) {
          state.courses = state.courses.map(c => 
            c.id === updatedCourse.id ? { ...c, ...updatedCourse } : c
          );
          if (state.selectedCourse && state.selectedCourse.id === updatedCourse.id) {
            state.selectedCourse = { ...state.selectedCourse, ...updatedCourse };
          }
        }
        state.cacheTimestamp = null; // Invalidate cache so fresh fetch works
        state.updateSuccess = action.payload?.message || 'Course updated successfully.';
      })
      .addCase(updateCourseAsync.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || 'Failed to update course.';
      });
  }
});

export const { setFilters, clearSelectedCourse, clearCourseCache, clearDeleteStatus, clearUpdateStatus } = coursesSlice.actions;
export default coursesSlice.reducer;
