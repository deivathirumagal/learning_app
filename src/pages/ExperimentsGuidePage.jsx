import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  FileCode
} from 'lucide-react';

export const ExperimentsGuidePage = () => {
  const experiments = [
    {
      id: "exp1",
      number: "Experiment 1",
      title: "Develop E-Learning Application with Course REST API",
      topics: "REST API, Axios, Fetch, Async Data",
      keyRequirements: [
        "Fetch courses asynchronously using async/await with simulated REST endpoints",
        "Search & filter courses by category and difficulty dynamically",
        "Fetch individual course details and syllabus materials dynamically",
        "Loading indicators, error banners, and functional Retry button"
      ],
      whereInCode: [
        "src/services/courseApi.js (getAllCourses, getCourseById)",
        "src/features/courses/coursesSlice.js (fetchCoursesAsync, fetchCourseDetailAsync)",
        "src/pages/CoursesCatalogPage.jsx",
        "src/components/CourseCard.jsx & CourseDetailsModal.jsx"
      ],
      vivaAnswers: [
        "Q: Why use async/await over promises?\nA: Async/await makes asynchronous code read synchronously, simplifies error handling with try/catch, and avoids promise callback nesting.",
        "Q: How is the Retry button implemented?\nA: It re-dispatches fetchCoursesAsync() with current filter parameters when an error state occurs."
      ]
    },
    {
      id: "exp2",
      number: "Experiment 2",
      title: "Implement Learning State Management",
      topics: "Redux Toolkit, Zustand, Middleware, Caching",
      keyRequirements: [
        "Global store created using Redux Toolkit configureStore()",
        "Separate coursesSlice, learningSlice, and authSlice",
        "Custom actionLoggerMiddleware monitoring every learning action in console and inspector",
        "60-second in-memory caching to avoid redundant API network calls",
        "Persistence of enrolled courses in browser storage (localStorage)"
      ],
      whereInCode: [
        "src/app/store.js (configureStore)",
        "src/app/actionLoggerMiddleware.js",
        "src/features/courses/coursesSlice.js (cacheTimestamp verification)",
        "src/features/learning/learningSlice.js (persisted state loader)"
      ],
      vivaAnswers: [
        "Q: What is Redux Middleware?\nA: Middleware sits between dispatching an action and the moment it reaches the reducer, allowing logging, async calls, or action interception.",
        "Q: How does caching improve web application performance?\nA: Prevents unnecessary network calls, reduces server load, and provides instant UI transitions for previously fetched data."
      ]
    },
    {
      id: "exp3",
      number: "Experiment 3",
      title: "Implement Course Enrollment and Learning CRUD Operations",
      topics: "REST API, CRUD, Axios/Fetch",
      keyRequirements: [
        "GET: Retrieve all courses and student learning history",
        "POST: Create new course enrollment and prevent duplicates",
        "PATCH/PUT: Update module completion and calculate progress percentage",
        "POST: Submit quiz scores and project assignments",
        "Disabled submission buttons while requests are in progress"
      ],
      whereInCode: [
        "src/services/courseApi.js (enrollCourse, updateProgress, submitQuizScore, submitAssignment)",
        "src/features/learning/learningSlice.js",
        "src/pages/LearningDashboardPage.jsx"
      ],
      vivaAnswers: [
        "Q: Difference between PUT and PATCH?\nA: PUT replaces an entire resource representation, while PATCH applies partial modifications to specific fields.",
        "Q: How do you prevent duplicate enrollment?\nA: The API service checks if an enrollment record already exists with the same courseId and student email, returning a 400 error."
      ]
    },
    {
      id: "exp4",
      number: "Experiment 4",
      title: "Implement E-Learning Authentication and Token Management",
      topics: "Authentication, Token Management, Protected APIs",
      keyRequirements: [
        "Student login page with controlled inputs",
        "Store token in client storage and Redux auth state",
        "Attach token to protected learning operations (Enroll, Quiz, Assignment, Certificate)",
        "Redirect unauthenticated students to login page",
        "Logout action that cleans token and resets active session",
        "Handle HTTP 401 Unauthorized and simulated expired tokens"
      ],
      whereInCode: [
        "src/services/authService.js",
        "src/features/authentication/authSlice.js",
        "src/pages/LoginPage.jsx",
        "src/components/CertificateModal.jsx"
      ],
      vivaAnswers: [
        "Q: How is token-based authentication structured?\nA: The client authenticates with credentials, receives a signed token, stores it, and sends it in the Authorization header (Bearer token) with each protected request.",
        "Q: What happens when a 401 Unauthorized status is returned?\nA: The application intercepts the response, alerts the user that their session is invalid/expired, clears stored tokens, and prompts them to re-login."
      ]
    }
  ];

  return (
    <div className="page-container">
      <div className="catalog-hero">
        <h2 className="page-heading">College Practical Guide & Viva Blueprint</h2>
        <p className="page-subheading">
          Comprehensive mapping of all 4 Unit experiments, requirements, architecture, code files, and examiner viva Q&A.
        </p>
      </div>

      <div className="exp-blueprint-grid">
        {experiments.map((exp) => (
          <div key={exp.id} className="blueprint-card">
            <div className="blueprint-header">
              <span className="bp-num">{exp.number}</span>
              <h3 className="bp-title">{exp.title}</h3>
              <span className="bp-topics">Topics: {exp.topics}</span>
            </div>

            <div className="bp-section">
              <h4><CheckCircle2 size={16} /> Implemented Requirements:</h4>
              <ul>
                {exp.keyRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="bp-section">
              <h4><FileCode size={16} /> Source Files:</h4>
              <div className="code-pills">
                {exp.whereInCode.map((f, i) => (
                  <code key={i} className="code-pill">{f}</code>
                ))}
              </div>
            </div>

            <div className="bp-section viva-box">
              <h4><HelpCircle size={16} /> Ready Viva Q&A:</h4>
              {exp.vivaAnswers.map((qa, i) => (
                <div key={i} className="qa-item">
                  <pre>{qa}</pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
