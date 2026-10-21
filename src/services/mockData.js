// Initial mock datasets for e-learning courses
export const INITIAL_COURSES = [
  {
    id: "cs101",
    title: "Introduction to React & Modern Web Apps",
    category: "Web Development",
    difficulty: "Beginner",
    instructor: "Dr. Ananya Sharma",
    rating: 4.8,
    duration: "6 Weeks",
    description: "Master React fundamentals, component design, hooks, and modern frontend application development step-by-step.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m1", title: "Module 1: Components and JSX Syntax", type: "PDF Notes", duration: "15 mins" },
      { id: "m2", title: "Module 2: State and Props Deep Dive", type: "Video Lecture", duration: "35 mins" },
      { id: "m3", title: "Module 3: useEffect & REST API Integration", type: "Lab Guide", duration: "45 mins" }
    ],
    quizzes: [
      { id: "q1", question: "What hook is primarily used for handling side effects in React?", options: ["useState", "useEffect", "useContext", "useReducer"], answer: "useEffect" },
      { id: "q2", question: "In React, data flows in which direction?", options: ["Bidirectional", "Unidirectional (Top to bottom)", "Bottom to top", "Random"], answer: "Unidirectional (Top to bottom)" }
    ],
    assignments: [
      { id: "a1", title: "Build a Filterable Product Catalog", deadline: "End of Week 2", maxMarks: 100 }
    ]
  },
  {
    id: "cs102",
    title: "Advanced Data Structures & Algorithms",
    category: "Computer Science",
    difficulty: "Advanced",
    instructor: "Prof. Rajesh Verma",
    rating: 4.9,
    duration: "10 Weeks",
    description: "Deep dive into trees, graphs, dynamic programming, and complexity analysis for competitive programming.",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc007a164a6?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m4", title: "Module 1: Binary Trees and AVL Balancing", type: "PDF Notes", duration: "25 mins" },
      { id: "m5", title: "Module 2: Graph Traversals (BFS, DFS, Dijkstra)", type: "Video Lecture", duration: "50 mins" },
      { id: "m6", title: "Module 3: Dynamic Programming Memoization", type: "Lab Sheet", duration: "60 mins" }
    ],
    quizzes: [
      { id: "q3", question: "What is the time complexity of searching in a balanced AVL tree?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], answer: "O(log n)" },
      { id: "q4", question: "Which algorithm finds the shortest path in a weighted graph without negative cycles?", options: ["Dijkstra", "Kruskal", "Prim", "Tarjan"], answer: "Dijkstra" }
    ],
    assignments: [
      { id: "a2", title: "Implement Topological Sort & Cycle Detection", deadline: "End of Week 4", maxMarks: 100 }
    ]
  },
  {
    id: "cs103",
    title: "Fullstack Database Systems & SQL/NoSQL",
    category: "Database",
    difficulty: "Intermediate",
    instructor: "Er. Sneha Kulkarni",
    rating: 4.7,
    duration: "8 Weeks",
    description: "Understand relational schema design, normalization, ACID properties, indexing, and MongoDB document schemas.",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m7", title: "Module 1: Relational Schema & 3NF Normalization", type: "PDF Notes", duration: "20 mins" },
      { id: "m8", title: "Module 2: Indexing Strategies & Query Optimization", type: "Video Lecture", duration: "40 mins" }
    ],
    quizzes: [
      { id: "q5", question: "Which normal form removes partial dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: "2NF" }
    ],
    assignments: [
      { id: "a3", title: "Design Normalized E-Commerce Database Schema", deadline: "End of Week 3", maxMarks: 100 }
    ]
  },
  {
    id: "cs104",
    title: "Cloud Computing & DevOps Essentials",
    category: "Cloud & DevOps",
    difficulty: "Intermediate",
    instructor: "Vikram Malhotra",
    rating: 4.6,
    duration: "5 Weeks",
    description: "Practical guide to Docker containers, CI/CD pipelines, Kubernetes basics, and cloud deployment architecture.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m9", title: "Module 1: Docker Containers & Dockerfile", type: "Video Lecture", duration: "30 mins" },
      { id: "m10", title: "Module 2: Continuous Integration with GitHub Actions", type: "Lab Guide", duration: "45 mins" }
    ],
    quizzes: [
      { id: "q6", question: "Which Docker command creates an image from a Dockerfile?", options: ["docker run", "docker build", "docker push", "docker start"], answer: "docker build" }
    ],
    assignments: [
      { id: "a4", title: "Containerize a React + Node.js Microservice", deadline: "End of Week 2", maxMarks: 100 }
    ]
  },
  {
    id: "cs105",
    title: "Machine Learning with Python & Scikit-Learn",
    category: "Artificial Intelligence",
    difficulty: "Advanced",
    instructor: "Dr. Arvind Rao",
    rating: 4.9,
    duration: "8 Weeks",
    description: "Explore linear models, decision trees, random forests, clustering, model evaluation metrics, and hyperparameter tuning.",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m11", title: "Module 1: Supervised vs Unsupervised Learning", type: "PDF Notes", duration: "20 mins" },
      { id: "m12", title: "Module 2: Model Evaluation & Cross-Validation", type: "Video Lecture", duration: "40 mins" }
    ],
    quizzes: [
      { id: "q7", question: "What metric is best for evaluating imbalanced classification problems?", options: ["Accuracy", "F1-Score / AUC-ROC", "Mean Squared Error", "R-squared"], answer: "F1-Score / AUC-ROC" }
    ],
    assignments: [
      { id: "a5", title: "Customer Churn Prediction Pipeline", deadline: "End of Week 5", maxMarks: 100 }
    ]
  },
  {
    id: "cs106",
    title: "Cyber Security Fundamentals & Ethical Hacking",
    category: "Security",
    difficulty: "Beginner",
    instructor: "Pooja Hegde",
    rating: 4.8,
    duration: "6 Weeks",
    description: "Learn web application vulnerability assessments, OWASP Top 10, network scanning, cryptography, and defense.",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    materials: [
      { id: "m13", title: "Module 1: Network Security & Port Scanning", type: "Lab Guide", duration: "30 mins" },
      { id: "m14", title: "Module 2: OWASP Top 10 Web Vulnerabilities", type: "Video Lecture", duration: "45 mins" }
    ],
    quizzes: [
      { id: "q8", question: "Which OWASP risk involves executing untrusted script in user's browser?", options: ["SQL Injection", "XSS (Cross-Site Scripting)", "Broken Access Control", "CSRF"], answer: "XSS (Cross-Site Scripting)" }
    ],
    assignments: [
      { id: "a6", title: "Vulnerability Audit Report for Demo Portal", deadline: "End of Week 3", maxMarks: 100 }
    ]
  }
];
