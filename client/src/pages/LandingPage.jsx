import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Terminal,
  FileCode2,
  GitPullRequest,
  BarChart3,
  Bot,
  Zap,
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      await demoLogin();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] dark:bg-[#080F17] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 selection:bg-[#12D6C5]/20 selection:text-[#12D6C5]">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#D8E3EA] dark:border-[#263849]/70 sticky top-0 bg-[#F3F7FA]/80 dark:bg-[#080F17]/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/30 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              CreateCode <span className="text-[#089E9A] dark:text-[#12D6C5]">AI</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-[#94A3B8]">
            <a href="#features" className="hover:text-[#089E9A] dark:hover:text-[#12D6C5] transition-colors">
              Features
            </a>
            <a href="#assistant" className="hover:text-[#089E9A] dark:hover:text-[#12D6C5] transition-colors">
              AI Assistant
            </a>
            <a href="#playground" className="hover:text-[#089E9A] dark:hover:text-[#12D6C5] transition-colors">
              Playground
            </a>
            <a href="#faq" className="hover:text-[#089E9A] dark:hover:text-[#12D6C5] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#172636] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#12D6C5]" /> : <Moon className="w-4 h-4 text-[#089E9A]" />}
            </button>

            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} size="sm">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#12D6C5]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12D6C5]/10 border border-[#12D6C5]/20 text-[#089E9A] dark:text-[#12D6C5] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Developer Productivity Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#12D6C5] via-[#38BDF8] to-[#0284C7]">
                Code Review &amp;
              </span>{' '}
              Developer Productivity
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-[#94A3B8] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Review code, detect bugs, improve performance, debug syntax, run multi-language code, and automate your development workflow — all powered by AI.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/auth?tab=register')}
                className="gap-2 shadow-glow-teal"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleDemoClick}
                className="gap-2"
              >
                View Live Demo
              </Button>
            </div>

            {/* Feature Checkmarks matching reference */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4 text-xs font-medium text-slate-600 dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12D6C5]" />
                <span>AI Code Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12D6C5]" />
                <span>GitHub Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#12D6C5]" />
                <span>Judge0 Code Execution</span>
              </div>
            </div>
          </div>

          {/* Right Hero Preview: Recreating screenshot 1 product preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl bg-[#0D1722] border border-[#263849] p-4 shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-[#263849]/70 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-[#94A3B8]">sum_array.cpp — CreateCode AI</div>
                <div className="w-4" />
              </div>

              {/* Code window */}
              <div className="font-mono text-xs text-[#F1F5F9] space-y-1.5 pb-8 overflow-x-auto">
                <div><span className="text-[#38BDF8]">int</span> <span className="text-[#12D6C5]">sum</span>(<span className="text-[#38BDF8]">int</span> arr[], <span className="text-[#38BDF8]">int</span> n) {'{'}</div>
                <div className="pl-4"><span className="text-[#38BDF8]">int</span> sum = <span className="text-amber-400">0</span>;</div>
                <div className="pl-4 text-rose-400 bg-rose-500/10 py-0.5 rounded px-1">
                  <span className="text-[#38BDF8]">for</span> (<span className="text-[#38BDF8]">int</span> i = <span className="text-amber-400">0</span>; i &lt;= n; i++) {'{'} <span className="text-rose-400 font-bold">// ⚠️ Error: i &lt;= n</span>
                </div>
                <div className="pl-8">sum += arr[i];</div>
                <div className="pl-4">{'}'}</div>
                <div className="pl-4"><span className="text-[#38BDF8]">return</span> sum;</div>
                <div>{'}'}</div>
              </div>

              {/* Floating AI Review overlay card (Matching Reference Image 1) */}
              <div className="absolute right-6 bottom-5 w-64 bg-[#111E2B]/95 backdrop-blur-md border border-[#12D6C5]/40 rounded-xl p-3.5 shadow-2xl animate-fade-in">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#263849]">
                  <div className="w-6 h-6 rounded-lg bg-[#12D6C5]/20 flex items-center justify-center text-[#12D6C5]">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#F1F5F9]">AI Review</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="font-medium">2 Bugs Found</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-medium">1 Security Issue</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="font-medium">3 Improvements</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-medium">Optimized Code Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-[#D8E3EA] dark:border-[#263849]/60 bg-white/50 dark:bg-[#0D1722]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Everything You Need in One Developer Workspace
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Comprehensive toolset designed for individual developers to inspect, optimize, execute, and safeguard their code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/20 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">AI Coding Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                7 specialized AI modes: Debug, Optimize, Explain, Security, Complexity Analysis, Code Conversion, and Test Case generation with streaming SSE.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Code Playground</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Integrated Monaco Editor with multi-language execution (C, C++, Java, Python, JS), custom stdin, and comprehensive test case verification.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">AI Code Reviews</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Automated reviews providing quality scores, severity classifications, line-by-line findings, and suggested diff corrections.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Automatic PR Review</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Connect GitHub webhooks to automatically review opened pull requests in background queues and optionally post review comments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Issues &amp; Security</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Detect hardcoded secrets, SQL injection risks, DOM-XSS vectors, and off-by-one errors with an issue resolution tracking workflow.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Developer Analytics</h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Visualize code quality progression over time, issue distribution by category, and review completion throughput.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-[#D8E3EA] dark:border-[#263849]/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849]">
              <h4 className="text-sm font-bold mb-1">How does CreateCode AI review my code?</h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                It uses a dual-engine architecture: static analysis for security vulnerabilities (secrets, AST pattern matching) combined with Google Gemini API for deep semantic logic analysis.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849]">
              <h4 className="text-sm font-bold mb-1">Is code executed safely?</h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                Yes! Code in the Playground is submitted to Judge0 API sandboxes with strictly enforced memory and execution time limits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849]">
              <h4 className="text-sm font-bold mb-1">Are GitHub tokens stored securely?</h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                Tokens are encrypted on the backend using AES-256-GCM authenticated encryption and never transmitted to client JavaScript.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D8E3EA] dark:border-[#263849] py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#089E9A] dark:text-[#12D6C5]" />
            <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">CreateCode AI</span>
            <span>— Write Smarter. Debug Faster. Build Better.</span>
          </div>
          <div>© {new Date().getFullYear()} CreateCode AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

