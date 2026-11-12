/**
 * Static Analysis & Linting Service
 * Scans code for security vulnerabilities, common bugs, performance risks, and maintainability concerns.
 */

const scanCode = (code, filename = 'code.js', language = 'javascript') => {
  const findings = [];
  if (!code || typeof code !== 'string') {
    return {
      findings: [],
      metrics: {
        codeQuality: 100,
        security: 100,
        performance: 100,
        maintainability: 100,
      },
      overallScore: 100,
    };
  }

  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // 1. Hardcoded Secrets & API Keys
    if (/(['"])(?:api[_-]?key|secret|password|token|bearer)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{12,}['"]/i.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'security',
        severity: 'critical',
        title: 'Hardcoded Secret Detected',
        description: 'Possible hardcoded API key, token, or secret detected in source code.',
        suggestion: 'Store secrets in environment variables (.env) and access them securely.',
        suggestedCode: 'const apiKey = process.env.API_KEY;',
      });
    }

    // 2. Dangerous eval / Function constructor
    if (/\beval\s*\(/.test(trimmed) || /new\s+Function\s*\(/.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'security',
        severity: 'critical',
        title: 'Dangerous Code Execution (eval/Function)',
        description: 'Using `eval()` or `new Function()` allows arbitrary code execution and opens remote code execution vulnerabilities.',
        suggestion: 'Use safe JSON parsing, predefined functions, or dedicated sandboxed parsers instead.',
        suggestedCode: 'JSON.parse(data);',
      });
    }

    // 3. Insecure DOM manipulation
    if (/innerHTML\s*=/i.test(trimmed) || /dangerouslySetInnerHTML/i.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'security',
        severity: 'high',
        title: 'Potential Cross-Site Scripting (XSS)',
        description: 'Directly assigning unescaped strings to `innerHTML` exposes the application to DOM-based XSS attacks.',
        suggestion: 'Use textContent, innerText, or sanitize HTML before injecting.',
        suggestedCode: 'element.textContent = sanitize(userInput);',
      });
    }

    // 4. SQL Injection Risk
    if (/SELECT\s+.*\s+FROM\s+.*\s*\+\s*['"]?[a-zA-Z0-9_]+/i.test(trimmed) || /WHERE\s+.*=\s*['"]\s*\+/i.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'security',
        severity: 'critical',
        title: 'SQL Injection Vulnerability',
        description: 'Concatenating user input directly into SQL queries allows attackers to alter query logic.',
        suggestion: 'Use parameterized queries or prepared statements.',
        suggestedCode: 'db.query("SELECT * FROM users WHERE id = ?", [userId]);',
      });
    }

    // 5. Off-by-one loop indexing (e.g. for (int i = 0; i <= n; i++) arr[i])
    if (/for\s*\(\s*(?:int|let|var)?\s*(\w+)\s*=\s*0\s*;\s*\1\s*<=\s*(\w+(?:\.length|\[\w+\])?)\s*;/i.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'bug',
        severity: 'high',
        title: 'Off-By-One Indexing Bug',
        description: 'Loop condition uses `<= length` or `<= n`, which causes an out-of-bounds array access on the final iteration.',
        suggestion: 'Change the loop condition from `<=` to `<` to respect zero-based indexing.',
        suggestedCode: trimmed.replace(/<=/, '<'),
      });
    }

    // 6. Insecure Equality Comparison (== vs === in JS)
    if (language === 'javascript' && /[^!=]==[^=]/.test(trimmed) && !/typeof/.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'maintainability',
        severity: 'low',
        title: 'Loose Equality Operator',
        description: 'Using `==` allows unintended type coercion.',
        suggestion: 'Use strict equality `===` for type-safe comparisons.',
        suggestedCode: trimmed.replace(/==/g, '==='),
      });
    }

    // 7. Unhandled Promise / Missing await
    if (/\.then\s*\(/.test(trimmed) && !/\.catch\s*\(/.test(trimmed) && !/catch/i.test(code)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'bug',
        severity: 'medium',
        title: 'Unhandled Promise Rejection',
        description: 'Promise `.then()` chain lacks an explicit `.catch()` handler or try/catch block.',
        suggestion: 'Add `.catch(err => ...)` or convert to `async/await` with `try/catch`.',
        suggestedCode: `${trimmed}.catch(err => console.error(err));`,
      });
    }

    // 8. Console.log in production code
    if (/\bconsole\.log\s*\(/.test(trimmed)) {
      findings.push({
        file: filename,
        lineStart: lineNum,
        lineEnd: lineNum,
        category: 'maintainability',
        severity: 'info',
        title: 'Extraneous Debugging Log',
        description: 'Found `console.log()` statement which should be removed or replaced with a production logger before deployment.',
        suggestion: 'Remove console.log or use a structured logger such as Winston / Morgan.',
        suggestedCode: '',
      });
    }
  });

  // Calculate static metrics
  const totalFindings = findings.length;
  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const medium = findings.filter(f => f.severity === 'medium').length;

  const scoreDeduction = (critical * 20) + (high * 10) + (medium * 5);
  const codeQuality = Math.max(40, 100 - scoreDeduction);
  const security = Math.max(30, 100 - (critical * 25 + high * 15));
  const performance = Math.max(50, 95 - (findings.filter(f => f.category === 'performance').length * 10));
  const maintainability = Math.max(50, 95 - (findings.filter(f => f.category === 'maintainability').length * 8));

  return {
    findings,
    metrics: {
      codeQuality: Math.round(codeQuality),
      security: Math.round(security),
      performance: Math.round(performance),
      maintainability: Math.round(maintainability),
    },
    overallScore: Math.round((codeQuality + security + performance + maintainability) / 4),
  };
};

module.exports = {
  scanCode,
};

