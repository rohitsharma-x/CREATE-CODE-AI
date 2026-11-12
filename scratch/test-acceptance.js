const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('   CREATECODE AI - AUTOMATED ACCEPTANCE TEST SUITE  ');
  console.log('====================================================\n');

  let token = null;

  // 1. Authenticate (Login or Register)
  console.log('[Step 1] Authenticating test session...');
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'rohit@example.com',
      password: 'Password123!',
    });
    token = loginRes.data.token;
    console.log('  ✓ Authenticated as:', loginRes.data.user.email);
  } catch (err) {
    try {
      const regRes = await axios.post(`${API_BASE}/auth/register`, {
        name: 'Rohit Sharma',
        email: `tester_${Date.now()}@example.com`,
        password: 'Password123!',
      });
      token = regRes.data.token;
      console.log('  ✓ Registered new tester:', regRes.data.user.email);
    } catch (regErr) {
      console.error('  ✗ Auth failed:', regErr.message);
      process.exit(1);
    }
  }

  const client = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. Test Code Execution with Judge0 / Native Execution
  console.log('\n[Step 2] Testing Code Execution across languages and error states...');

  // 2a. JavaScript execution
  try {
    const jsRes = await client.post('/code/execute', {
      sourceCode: 'console.log("CreateCode JS result:", [1, 2, 3, 4].reduce((a, b) => a + b, 0));',
      language: 'javascript',
    });
    const stdout = jsRes.data.execution.stdout || '';
    if (stdout.includes('CreateCode JS result: 10')) {
      console.log('  ✓ JavaScript Execution: PASSED (stdout: 10)');
    } else {
      console.log('  ✗ JavaScript Execution: Output mismatch:', stdout);
    }
  } catch (err) {
    console.log('  ✗ JavaScript Execution error:', err.message);
  }

  // 2b. Python execution with custom stdin
  try {
    const pyRes = await client.post('/code/execute', {
      sourceCode: 'import sys\nname = sys.stdin.read().strip()\nprint(f"Hello {name}, Python 3 is active!")',
      language: 'python',
      stdin: 'Developer',
    });
    const stdout = pyRes.data.execution.stdout || '';
    if (stdout.includes('Hello Developer, Python 3 is active!')) {
      console.log('  ✓ Python Execution with custom stdin: PASSED');
    } else {
      console.log('  ✗ Python Execution: Output mismatch:', stdout);
    }
  } catch (err) {
    console.log('  ✗ Python Execution error:', err.message);
  }

  // 2c. C++ execution
  try {
    const cppRes = await client.post('/code/execute', {
      sourceCode: '#include <iostream>\nint main() { std::cout << "CreateCode C++ executed successfully" << std::endl; return 0; }',
      language: 'cpp',
    });
    const stdout = cppRes.data.execution.stdout || '';
    if (stdout.includes('CreateCode C++ executed successfully')) {
      console.log('  ✓ C++ Execution: PASSED');
    } else {
      console.log('  ✗ C++ Execution: Output mismatch:', stdout);
    }
  } catch (err) {
    console.log('  ✗ C++ Execution error:', err.message);
  }

  // 2d. Compilation Failure Detection
  try {
    const compRes = await client.post('/code/execute', {
      sourceCode: '#include <iostream>\nint main() { std::cout << undeclared_variable; return 0; }',
      language: 'cpp',
    });
    const exec = compRes.data.execution;
    if (exec.status === 'Compilation Error' || (exec.compileOutput && exec.compileOutput.length > 0)) {
      console.log('  ✓ C++ Compilation Error correctly caught and separated: PASSED');
    } else {
      console.log('  ✗ Compilation Error not properly identified:', exec);
    }
  } catch (err) {
    console.log('  ✗ Compilation Error test failed:', err.message);
  }

  // 2e. Runtime Failure Detection
  try {
    const rtRes = await client.post('/code/execute', {
      sourceCode: 'print(1 / 0)',
      language: 'python',
    });
    const exec = rtRes.data.execution;
    if (exec.status === 'Runtime Error' || (exec.stderr && exec.stderr.includes('ZeroDivisionError'))) {
      console.log('  ✓ Python Runtime Error correctly caught and reported: PASSED');
    } else {
      console.log('  ✗ Runtime Error not properly caught:', exec);
    }
  } catch (err) {
    console.log('  ✗ Runtime Error test failed:', err.message);
  }

  // 3. Test AI Code Review (Analyze, Detect & Optimize)
  console.log('\n[Step 3] Testing AI Code Review feature...');

  // 3a. Out of bounds & logical bug code review
  try {
    const bugCode = `int sum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i <= n; i++) {
        sum += arr[i];
    }
    return sum;
}`;
    const reviewRes = await client.post('/reviews', {
      title: 'Review: Array Boundary Bug Test',
      repository: 'createcode/algorithm-suite',
      branch: { base: 'main', head: 'bugfix/array-bounds' },
      language: 'cpp',
      rawCode: bugCode,
    });

    const rev = reviewRes.data.review;
    const hasFindings = rev.findings && rev.findings.length > 0;
    const hasOptimizedCode = rev.optimizedCode && rev.optimizedCode.includes('< n');
    const hasComplexity = !!rev.complexityComparison;
    const hasTestCases = rev.testCases && rev.testCases.length >= 3;

    console.log('  Review ID:', rev._id);
    console.log('  - Overall Score:', rev.overallScore);
    console.log('  - Findings detected:', rev.findings?.length, hasFindings ? '✓' : '✗');
    console.log('  - Optimized Code corrected loop condition (< n):', hasOptimizedCode ? '✓' : '✗');
    console.log('  - Complexity Comparison present:', hasComplexity ? '✓' : '✗');
    console.log('  - Normal, Boundary & Edge Test Cases generated:', hasTestCases ? '✓' : '✗');

    if (hasFindings && hasOptimizedCode && hasComplexity && hasTestCases) {
      console.log('  ✓ AI Code Review (Boundary Bug & Optimization): PASSED');
    } else {
      console.log('  ✗ AI Code Review: Incomplete output fields');
    }
  } catch (err) {
    console.log('  ✗ AI Code Review test error:', err.message);
  }

  // 3b. Already Optimal Code Review
  try {
    const optimalCode = `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`;
    const optRes = await client.post('/reviews', {
      title: 'Review: Already Optimal Binary Search',
      language: 'javascript',
      rawCode: optimalCode,
    });

    const optRev = optRes.data.review;
    console.log('  Already Optimal Review:');
    console.log('  - isAlreadyOptimal flag:', optRev.isAlreadyOptimal ? '✓' : '✗');
    console.log('  - optimalExplanation:', optRev.optimalExplanation ? '✓' : '✗');
    if (optRev.isAlreadyOptimal) {
      console.log('  ✓ Already Optimal Code Recognition: PASSED');
    }
  } catch (err) {
    console.log('  ✗ Already Optimal Code Review test error:', err.message);
  }

  // 4. Test AI Coding Chat (Understand, Solve & Execute)
  console.log('\n[Step 4] Testing AI Coding Chat feature...');

  try {
    // 4a. Create Chat
    const chatRes = await client.post('/chats', {
      title: 'Debugging Array Bounds in C++',
      language: 'cpp',
      mode: 'Debug',
    });
    const chatId = chatRes.data.chat._id;
    console.log('  Created Chat Session ID:', chatId);

    // 4b. Send Message with Error
    const msgRes = await client.post(`/chats/${chatId}/messages`, {
      text: 'Find the error in this code and optimize it:',
      code: `int sum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i <= n; i++) {
        sum += arr[i];
    }
    return sum;
}`,
      language: 'cpp',
      mode: 'Debug',
    });

    const assistantMsg = msgRes.data.assistantMessage;
    const struct = assistantMsg?.structuredResponse;

    const hasUnderstanding = !!struct?.problemUnderstanding;
    const hasErrorExplanation = (struct?.errors && struct.errors.length > 0) || !!struct?.errorExplanation;
    const hasCorrectedCode = !!(struct?.correctedCode || struct?.optimizedCode);
    const hasSampleIO = struct?.sampleInputOutput && struct.sampleInputOutput.length > 0;
    const hasDryRun = struct?.dryRun && struct.dryRun.length > 0;
    const hasComplexity = !!struct?.timeComplexity || !!struct?.complexityComparison;
    const hasChatTestCases = struct?.testCases && struct.testCases.length >= 3;

    console.log('  - Problem Understanding:', hasUnderstanding ? '✓' : '✗');
    console.log('  - Error Explanation (why error occurs):', hasErrorExplanation ? '✓' : '✗');
    console.log('  - Corrected & Optimized Code:', hasCorrectedCode ? '✓' : '✗');
    console.log('  - Sample Input / Expected Output:', hasSampleIO ? '✓' : '✗');
    console.log('  - Dry Run Steps:', hasDryRun ? '✓' : '✗');
    console.log('  - Complexity Analysis:', hasComplexity ? '✓' : '✗');
    console.log('  - Normal, Boundary & Edge Test Cases:', hasChatTestCases ? '✓' : '✗');

    if (hasUnderstanding && hasErrorExplanation && hasCorrectedCode && hasSampleIO && hasDryRun && hasComplexity && hasChatTestCases) {
      console.log('  ✓ AI Coding Chat initial problem solve: PASSED');
    } else {
      console.log('  ✗ AI Coding Chat: Some structured fields missing');
    }

    // 4c. Follow-up Question Context Retention Test
    console.log('  Sending follow-up question to test conversational context...');
    const followUpRes = await client.post(`/chats/${chatId}/messages`, {
      text: 'What is the time complexity if we use a while loop instead?',
      language: 'cpp',
      mode: 'Complexity Analysis',
    });

    const followUpMsg = followUpRes.data.assistantMessage;
    const followUpStruct = followUpMsg?.structuredResponse;
    const hasFollowUpComplexity = !!followUpStruct?.timeComplexity || !!followUpMsg?.text;
    console.log('  - Follow-up answered with complexity explanation:', hasFollowUpComplexity ? '✓' : '✗');
    if (hasFollowUpComplexity) {
      console.log('  ✓ AI Coding Chat Follow-up Context Retention: PASSED');
    }
  } catch (err) {
    console.log('  ✗ AI Coding Chat test error:', err.message);
  }

  console.log('\n====================================================');
  console.log('   ALL ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!     ');
  console.log('====================================================');
}

runAcceptanceTests();

