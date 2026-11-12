import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco Editor loader to avoid jsDelivr missing source-map 404 warnings
loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs',
  },
});
import {
  Play,
  RotateCcw,
  Trash2,
  Clock,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Terminal,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const CODE_TEMPLATES = {
  javascript: `// CreateCode AI - JavaScript Playground
function solve(arr) {
    console.log("Processing array:", arr);
    const sum = arr.reduce((acc, curr) => acc + curr, 0);
    return sum;
}

const input = [10, 20, 30, 40, 50];
const result = solve(input);
console.log("Sum result:", result);
`,
  python: `# CreateCode AI - Python 3 Playground
def solve(arr):
    print(f"Processing array: {arr}")
    return sum(arr)

input_data = [10, 20, 30, 40, 50]
result = solve(input_data)
print(f"Sum result: {result}")
`,
  cpp: `// CreateCode AI - C++ Playground
#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    vector<int> arr = {10, 20, 30, 40, 50};
    int sum = 0;
    for (size_t i = 0; i < arr.size(); i++) {
        sum += arr[i];
    }
    cout << "Sum result: " << sum << endl;
    return 0;
}
`,
  c: `// CreateCode AI - C Playground
#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int n = sizeof(arr) / sizeof(arr[0]);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    printf("Sum result: %d\\n", sum);
    return 0;
}
`,
  java: `// CreateCode AI - Java Playground
public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        System.out.println("Sum result: " + sum);
    }
}
`,
};

export const PlaygroundPage = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  const { addToast } = useNotifications();

  const [language, setLanguage] = useState(location.state?.initialLanguage || 'javascript');
  const [sourceCode, setSourceCode] = useState(location.state?.initialCode || CODE_TEMPLATES.javascript);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.initialCode) {
      setSourceCode(location.state.initialCode);
      if (location.state.initialLanguage) {
        setLanguage(location.state.initialLanguage);
      }
    }
  }, [location.state]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setSourceCode(CODE_TEMPLATES[newLang] || '// Write your code here');
    setResult(null);
  };

  const handleRunCode = async () => {
    if (!sourceCode.trim()) return;

    setRunning(true);
    try {
      const res = await api.post('/code/execute', {
        sourceCode,
        language,
        stdin,
      });

      if (res.data?.success) {
        setResult(res.data.result);
        addToast('Execution completed', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Code execution failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setSourceCode(CODE_TEMPLATES[language] || '');
    setResult(null);
    setStdin('');
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Code Playground
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Write, execute, and verify code with Judge0 runtime execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none font-bold"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 9.2)</option>
            <option value="c">C (GCC 9.2)</option>
            <option value="java">Java (OpenJDK 13)</option>
          </select>

          <Button variant="outline" size="sm" onClick={handleReset} icon={RotateCcw}>
            Reset
          </Button>

          <Button
            size="sm"
            onClick={handleRunCode}
            loading={running}
            icon={Play}
            className="shadow-glow-teal font-bold"
          >
            Run Code
          </Button>
        </div>
      </div>

      {/* Editor & Console Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-13rem)]">
        {/* Left: Monaco Editor */}
        <Card className="lg:col-span-7 flex flex-col overflow-hidden p-0 border border-[#D8E3EA] dark:border-[#263849]">
          <div className="h-10 px-4 bg-slate-50 dark:bg-[#0D1722] border-b border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Editor — {language}</span>
            <span>Tab: 4 spaces</span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'c' ? 'c' : language === 'cpp' ? 'cpp' : language}
              theme={isDark ? 'vs-dark' : 'light'}
              value={sourceCode}
              onChange={(val) => setSourceCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </Card>

        {/* Right: Custom stdin & Output Console */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Custom Stdin Box */}
          <Card className="p-3.5 space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Custom Standard Input (stdin)
            </label>
            <textarea
              rows={2}
              placeholder="Provide custom input arguments if needed..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="w-full p-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </Card>

          {/* Output Terminal */}
          <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-[#0A121C] border border-[#263849] text-[#F1F5F9]">
            <div className="h-10 px-4 bg-[#0D1722] border-b border-[#263849] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#12D6C5]" />
                <span className="font-bold text-white">Execution Console</span>
              </div>

              {result && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-[#12D6C5]" />
                    {result.time}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Cpu className="w-3 h-3 text-sky-400" />
                    {result.memory}
                  </span>
                  <Badge variant={result.statusCode === 3 ? 'success' : 'error'}>
                    {result.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Console stdout/stderr */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 leading-relaxed">
              {!result && !running && (
                <p className="text-slate-500">
                  Ready. Click "Run Code" to compile and execute in sandbox.
                </p>
              )}

              {running && (
                <p className="text-[#12D6C5] animate-pulse">
                  Submitting to execution sandbox...
                </p>
              )}

              {result && (
                <>
                  {result.compileOutput && (
                    <div className="text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      <div className="font-bold mb-1">Compilation Output:</div>
                      <pre className="whitespace-pre-wrap">{result.compileOutput}</pre>
                    </div>
                  )}

                  {result.stderr && (
                    <div className="text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      <div className="font-bold mb-1">Runtime Error (stderr):</div>
                      <pre className="whitespace-pre-wrap">{result.stderr}</pre>
                    </div>
                  )}

                  {result.stdout ? (
                    <div>
                      <div className="text-slate-400 font-semibold mb-1">Program Output:</div>
                      <pre className="text-emerald-400 whitespace-pre-wrap">{result.stdout}</pre>
                    </div>
                  ) : !result.stderr && !result.compileOutput ? (
                    <div className="text-slate-400 italic">
                      Program executed successfully with exit code {result.exitCode ?? 0} (no output was written to stdout).
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

