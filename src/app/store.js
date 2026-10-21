import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from '../features/courses/coursesSlice';
import learningReducer from '../features/learning/learningSlice';
import authReducer from '../features/authentication/authSlice';
import { actionLoggerMiddleware } from './actionLoggerMiddleware';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    learning: learningReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(actionLoggerMiddleware)
});
