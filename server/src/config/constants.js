module.exports = {
  ROLES: {
    DEVELOPER: 'developer',
    ADMIN: 'admin',
  },
  THEMES: {
    DARK: 'dark',
    LIGHT: 'light',
  },
  LANGUAGES: [
    { id: 63, name: 'JavaScript (Node.js 18.15.0)', monacoId: 'javascript', ext: 'js' },
    { id: 71, name: 'Python (3.11.2)', monacoId: 'python', ext: 'py' },
    { id: 54, name: 'C++ (GCC 9.2.0)', monacoId: 'cpp', ext: 'cpp' },
    { id: 50, name: 'C (GCC 9.2.0)', monacoId: 'c', ext: 'c' },
    { id: 62, name: 'Java (OpenJDK 13.0.1)', monacoId: 'java', ext: 'java' },
    { id: 74, name: 'TypeScript (5.0.3)', monacoId: 'typescript', ext: 'ts' },
    { id: 60, name: 'Go (1.13.5)', monacoId: 'go', ext: 'go' },
    { id: 73, name: 'Rust (1.40.0)', monacoId: 'rust', ext: 'rs' },
  ],
  AI_MODES: [
    'Debug',
    'Optimize',
    'Explain',
    'Security',
    'Complexity Analysis',
    'Code Conversion',
    'Generate Test Cases',
  ],
  ISSUE_SEVERITIES: ['critical', 'high', 'medium', 'low', 'info'],
  ISSUE_CATEGORIES: ['bug', 'security', 'performance', 'maintainability'],
  ISSUE_STATUSES: ['open', 'resolved', 'dismissed', 'false_positive'],
  PROJECT_STATUSES: ['Active', 'In Progress', 'Completed', 'On Hold'],
};

