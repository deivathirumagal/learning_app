import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response; // { token, user }
    } catch (err) {
      return rejectWithValue(err.message || 'Authentication failed.');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, rollNo, department }, { rejectWithValue }) => {
    try {
      const response = await authService.register({ name, email, password, rollNo, department });
      return response; // { token, user }
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed.');
    }
  }
);

const initialToken = authService.getToken();
const initialUser = authService.getCurrentUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken && initialToken !== 'EXPIRED_TOKEN',
    loading: false,
    error: null,
    statusMessage: null
  },
  reducers: {
    logout: (state) => {
      authService.logout();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.statusMessage = 'Logged out successfully.';
    },
    clearAuthError: (state) => {
      state.error = null;
      state.statusMessage = null;
    },
    handleTokenExpired: (state) => {
      authService.logout();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = 'Your session has expired (HTTP 401). Please login again.';
    },
    setSimulatedExpiredToken: (state) => {
      authService.simulateTokenExpiry();
      state.token = 'EXPIRED_TOKEN';
      state.statusMessage = 'Token artificially expired to test 401 interception.';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.statusMessage = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.statusMessage = `Welcome back, ${action.payload.user.name}!`;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed.';
      })
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.statusMessage = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.statusMessage = `Registration successful! Welcome, ${action.payload.user.name}.`;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed.';
      });
  }
});

export const { logout, clearAuthError, handleTokenExpired, setSimulatedExpiredToken } = authSlice.actions;
export default authSlice.reducer;
