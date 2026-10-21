// Custom Redux Middleware to monitor learning and authentication actions
// Logs action type, payload, state snapshot, and saves action logs for viva demonstration

export const actionLoggerMiddleware = (store) => (next) => (action) => {
  // Only monitor learning, courses, and auth actions
  const isTargetAction = 
    action.type.startsWith('learning/') || 
    action.type.startsWith('courses/') || 
    action.type.startsWith('auth/');

  if (isTargetAction) {
    const timestamp = new Date().toLocaleTimeString();
    console.group(`[Learning Store Middleware] ${timestamp} - Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Previous State:', store.getState());
    
    // Store in window for on-screen debug & viva inspection
    if (typeof window !== 'undefined') {
      window.__REDUX_LOGS__ = window.__REDUX_LOGS__ || [];
      window.__REDUX_LOGS__.unshift({
        time: timestamp,
        type: action.type,
        payload: action.payload
      });
      // keep last 20 logs
      if (window.__REDUX_LOGS__.length > 20) {
        window.__REDUX_LOGS__.pop();
      }
    }
  }

  const result = next(action);

  if (isTargetAction) {
    console.log('Next State:', store.getState());
    console.groupEnd();
  }

  return result;
};
