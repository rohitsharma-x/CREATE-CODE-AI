import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MessageSquareCode,
  Plus,
  Search,
  Send,
  Paperclip,
  Copy,
  Check,
  Bot,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  Trash2,
  Code2,
  Play,
  Terminal,
  Loader2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Lightbulb,
  CornerDownLeft,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeChatId = searchParams.get('id');

  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Prompt input state
  const [inputMessage, setInputMessage] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [language, setLanguage] = useState('cpp');
  const [mode, setMode] = useState('Debug');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Per-message execution & tab state
  const [executingMap, setExecutingMap] = useState({});
  const [outputMap, setOutputMap] = useState({});
  const [codeTabMap, setCodeTabMap] = useState({}); // 'corrected' | 'optimized'
  const [showStdinMap, setShowStdinMap] = useState({});
  const [stdinMap, setStdinMap] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat list
  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      if (res.data?.success) {
        const list = res.data.chats || [];
        setChats(list);
        if (!activeChatId && list.length > 0) {
          setSearchParams({ id: list[0]._id });
        }
      }
    } catch (err) {
      console.warn('Failed to load chats');
    }
  };

  // Load specific chat messages
  const fetchChatDetails = async (id) => {
    try {
      const res = await api.get(`/chats/${id}`);
      if (res.data?.success) {
        setCurrentChat(res.data.chat);
        setMessages(res.data.messages || []);
        if (res.data.chat?.language) setLanguage(res.data.chat.language);
        if (res.data.chat?.mode) setMode(res.data.chat.mode);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.warn('Failed to load chat details');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchChatDetails(activeChatId);
    }
  }, [activeChatId]);

  const handleNewChat = async () => {
    try {
      const res = await api.post('/chats', {
        title: 'New Chat',
        language,
        mode,
      });
      if (res.data?.success) {
        const newChat = res.data.chat;
        setChats((prev) => [newChat, ...prev]);
        setSearchParams({ id: newChat._id });
        setMessages([]);
      }
    } catch (err) {
      addToast('Failed to create new chat', 'error');
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/chats/${id}`);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (activeChatId === id) {
        const remaining = chats.filter((c) => c._id !== id);
        if (remaining.length > 0) {
          setSearchParams({ id: remaining[0]._id });
        } else {
          setSearchParams({});
          setCurrentChat(null);
          setMessages([]);
        }
      }
      addToast('Chat deleted', 'info');
    } catch (err) {
      addToast('Failed to delete chat', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !inputCode.trim()) return;

    let targetChatId = activeChatId;

    // 1. If no chat active, create one first and continue seamlessly
    if (!targetChatId) {
      try {
        const createRes = await api.post('/chats', {
          title: inputMessage.slice(0, 30) || `${mode} ${language}`,
          language,
          mode,
        });
        if (createRes.data?.success) {
          const newChat = createRes.data.chat;
          targetChatId = newChat._id;
          setChats((prev) => [newChat, ...prev]);
          setSearchParams({ id: newChat._id });
          setCurrentChat(newChat);
        } else {
          addToast('Could not initialize chat session', 'error');
          return;
        }
      } catch (err) {
        addToast('Failed to start chat session', 'error');
        return;
      }
    }

    let payloadText = inputMessage.trim();
    let payloadCode = inputCode.trim();

    // Auto-extract code if user typed markdown code block inside inputMessage
    if (!payloadCode) {
      const codeBlockMatch = payloadText.match(/```(?:\w+)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        payloadCode = codeBlockMatch[1].trim();
        payloadText = payloadText.replace(/```(?:\w+)?\s*[\s\S]*?```/, '').trim() || 'Analyze, debug, and optimize this code:';
      }
    }

    setInputMessage('');
    setInputCode('');
    setShowCodeInput(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      sender: 'user',
      text: payloadText,
      code: payloadCode,
      language,
      mode,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await api.post(`/chats/${targetChatId}/messages`, {
        text: payloadText,
        code: payloadCode,
        language,
        mode,
      });

      if (res.data?.success) {
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMsg._id),
          res.data.userMessage,
          res.data.assistantMessage,
        ]);
        fetchChats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'AI request failed', 'error');
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleCopy = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast('Code copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunSolutionCode = async (code, lang, msgId) => {
    if (!code) return;
    setExecutingMap((prev) => ({ ...prev, [msgId]: true }));
    const customStdin = stdinMap[msgId] || '';

    try {
      const res = await api.post('/code/execute', {
        sourceCode: code,
        language: lang || language || 'javascript',
        stdin: customStdin,
      });
      const execData = res.data?.execution || res.data?.result;
      if (res.data?.success && execData) {
        setOutputMap((prev) => ({ ...prev, [msgId]: execData }));
        const isPass = execData.status === 'Accepted' || execData.statusCode === 3;
        addToast(
          `Execution output: ${execData.status || 'Accepted'}`,
          isPass ? 'success' : 'warning'
        );
      } else {
        addToast(res.data?.message || 'Execution failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Code execution failed', 'error');
    } finally {
      setExecutingMap((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  const handleOpenInPlayground = (code, lang) => {
    navigate('/playground', {
      state: {
        initialCode: code,
        initialLanguage: lang || language || 'javascript',
      },
    });
  };

  // Group chats by Today, Yesterday, This Week
  const todayChats = [];
  const yesterdayChats = [];
  const earlierChats = [];

  const now = new Date();
  chats
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .forEach((c) => {
      const chatDate = new Date(c.lastMessageAt || c.createdAt);
      const diffHours = (now - chatDate) / (1000 * 60 * 60);
      if (diffHours < 24) {
        todayChats.push(c);
      } else if (diffHours < 48) {
        yesterdayChats.push(c);
      } else {
        earlierChats.push(c);
      }
    });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-4 overflow-hidden">
      {/* Left Sidebar: Conversations list (Matching Reference Image 5) */}
      <div className="w-72 hidden md:flex flex-col bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-2xl overflow-hidden shrink-0 shadow-sm">
        {/* Top: New Chat button */}
        <div className="p-3 border-b border-[#D8E3EA] dark:border-[#263849]">
          <Button onClick={handleNewChat} icon={Plus} className="w-full text-xs py-2">
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#D8E3EA] dark:border-[#263849]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>
        </div>

        {/* Chats grouped by date */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {todayChats.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Today
              </div>
              <div className="space-y-1">
                {todayChats.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSearchParams({ id: c._id })}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors group ${
                      activeChatId === c._id
                        ? 'bg-[#089E9A]/10 dark:bg-[#12D6C5]/10 text-[#089E9A] dark:text-[#12D6C5] font-semibold'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#172636]'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(c._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yesterdayChats.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Yesterday
              </div>
              <div className="space-y-1">
                {yesterdayChats.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSearchParams({ id: c._id })}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors group ${
                      activeChatId === c._id
                        ? 'bg-[#089E9A]/10 dark:bg-[#12D6C5]/10 text-[#089E9A] dark:text-[#12D6C5] font-semibold'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#172636]'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(c._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {earlierChats.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Earlier
              </div>
              <div className="space-y-1">
                {earlierChats.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSearchParams({ id: c._id })}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors group ${
                      activeChatId === c._id
                        ? 'bg-[#089E9A]/10 dark:bg-[#12D6C5]/10 text-[#089E9A] dark:text-[#12D6C5] font-semibold'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#172636]'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(c._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel (Matching Reference Image 5) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-2xl overflow-hidden shadow-sm">
        {/* Header: Title, Language selector, Mode selector */}
        <div className="h-14 px-4 border-b border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#0D1722]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#12D6C5]/10 border border-[#12D6C5]/20 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                AI Coding Chat
              </h3>
              <p className="text-[10px] text-slate-400">Your personal AI pair programmer &amp; compiler</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none font-medium"
            >
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="typescript">TypeScript</option>
            </select>

            {/* AI Mode dropdown */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#12D6C5]/10 border border-[#12D6C5]/30 text-[#089E9A] dark:text-[#12D6C5] focus:outline-none font-bold"
            >
              <option value="Debug">⚙️ Debug</option>
              <option value="Optimize">⚡ Optimize</option>
              <option value="Explain">📖 Explain</option>
              <option value="Security">🛡️ Security</option>
              <option value="Complexity Analysis">📊 Complexity</option>
              <option value="Code Conversion">🔄 Convert</option>
              <option value="Generate Test Cases">🧪 Tests</option>
            </select>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-[#12D6C5]/10 flex items-center justify-center text-[#12D6C5] mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-1">
                Start a Pair Programming Session
              </h4>
              <p className="text-xs max-w-sm mb-4">
                Ask a technical question, paste code with bugs, or request complete solutions (e.g. Binary Search, Palindrome, Two Sum, or optimization).
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setInputMessage('Implement binary search algorithm with edge cases');
                    setMode('Optimize');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[11px] text-[#089E9A] dark:text-[#12D6C5] hover:border-[#12D6C5] transition-all"
                >
                  ⚡ Binary Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMessage('Find the error in this code and optimize it:');
                    setInputCode('int sum(int arr[], int n) {\n    int sum = 0;\n    for (int i = 0; i <= n; i++) {\n        sum += arr[i];\n    }\n    return sum;\n}');
                    setShowCodeInput(true);
                    setMode('Debug');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[11px] text-rose-400 hover:border-rose-400 transition-all"
                >
                  ⚙️ Array Out of Bounds Bug
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMessage('Solve Two Sum with optimal O(n) hash map');
                    setMode('Optimize');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[11px] text-sky-400 hover:border-sky-400 transition-all"
                >
                  🔍 Two Sum (Hash Map)
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const struct = msg.structuredResponse;
              const activeTab = codeTabMap[msg._id] || (struct?.optimizedCode && struct?.correctedCode ? 'optimized' : 'corrected');
              const solutionCode =
                activeTab === 'optimized' && struct?.optimizedCode
                  ? struct.optimizedCode
                  : (struct?.correctedCode || struct?.optimizedCode || msg.code || '');

              const solLang = msg.language || language || 'javascript';
              const isExecuting = executingMap[msg._id];
              const execResult = outputMap[msg._id];
              const showStdin = showStdinMap[msg._id];

              return (
                <div
                  key={msg._id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-[#12D6C5]/15 border border-[#12D6C5]/30 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-3xl w-full space-y-3 ${isUser ? 'items-end flex flex-col' : 'items-start'}`}>
                    {/* User Message */}
                    {isUser ? (
                      <div className="bg-[#EDF4F8] dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] rounded-2xl p-4 text-xs space-y-2 max-w-xl shadow-sm">
                        {msg.text && (
                          <div className="font-medium whitespace-pre-wrap break-words leading-relaxed font-sans text-[#0F172A] dark:text-[#F1F5F9]">
                            {msg.text}
                          </div>
                        )}
                        {msg.code && (
                          <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-[#0A121C] mt-2">
                            <div className="px-3 py-1 bg-white/5 border-b border-white/10 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                              <span>Code Snippet ({msg.language || language || 'code'})</span>
                            </div>
                            <pre className="p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed whitespace-pre">
                              <code>{msg.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* AI Structured Response (Matching Reference Image 5 & Specifications) */
                      <div className="space-y-3.5 w-full">
                        {/* 1. Problem Understanding */}
                        {struct?.problemUnderstanding && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636]/60 border border-[#D8E3EA] dark:border-[#263849] text-xs">
                            <div className="flex items-center gap-2 font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-1">
                              <Lightbulb className="w-4 h-4 text-amber-400" />
                              Problem Understanding
                            </div>
                            <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                              {struct.problemUnderstanding}
                            </p>
                          </div>
                        )}

                        {/* 2. Error Explanation (Red Card - Matching Reference Image 5) */}
                        {((struct?.errors && struct.errors.length > 0) || struct?.errorExplanation) && (
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                              Error Detected &amp; Explanation
                            </div>

                            {struct.errorExplanation && (
                              <p className="text-xs text-rose-400 pl-6 leading-relaxed">
                                {struct.errorExplanation}
                              </p>
                            )}

                            {struct.errors && struct.errors.length > 0 && (
                              <div className="pl-6 space-y-1.5 text-xs text-rose-400">
                                {struct.errors.map((err, i) => (
                                  <div key={i} className="leading-relaxed">
                                    <span className="font-semibold text-rose-500">
                                      {err.line ? `Line ${err.line}: ` : ''}
                                      {err.message || (typeof err === 'string' ? err : 'Error in logic.')}
                                    </span>
                                    {err.whyItOccurs && (
                                      <p className="text-rose-400/90 text-[11px] mt-0.5">
                                        Why it occurs: {err.whyItOccurs}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* High-level Summary / Explanation */}
                        {msg.text && (!struct?.problemUnderstanding || msg.text !== struct.problemUnderstanding) && (
                          <div className="text-xs text-[#0F172A] dark:text-[#F1F5F9] font-medium leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </div>
                        )}

                        {/* Step-by-Step Explanation */}
                        {struct?.stepByStepExplanation && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636]/60 border border-[#D8E3EA] dark:border-[#263849] text-xs space-y-2">
                            <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9] block">
                              Step-by-Step Solution Logic:
                            </span>
                            {Array.isArray(struct.stepByStepExplanation) ? (
                              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                                {struct.stepByStepExplanation.map((step, idx) => (
                                  <li key={idx} className="pl-1">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                                {struct.stepByStepExplanation}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 3. Corrected & Optimized Code Box (Green Card - Matching Reference Image 5) */}
                        {solutionCode && (
                          <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-[#0A121C]">
                            <div className="px-3.5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-400">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {/* Toggles if both corrected and optimized code are available */}
                                {struct?.correctedCode && struct?.optimizedCode && struct.correctedCode !== struct.optimizedCode ? (
                                  <div className="flex items-center gap-1.5 bg-black/40 p-0.5 rounded-lg border border-emerald-500/20">
                                    <button
                                      type="button"
                                      onClick={() => setCodeTabMap((prev) => ({ ...prev, [msg._id]: 'corrected' }))}
                                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                                        activeTab === 'corrected'
                                          ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                                          : 'text-emerald-400/70 hover:text-emerald-300'
                                      }`}
                                    >
                                      Corrected Code
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCodeTabMap((prev) => ({ ...prev, [msg._id]: 'optimized' }))}
                                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                                        activeTab === 'optimized'
                                          ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                                          : 'text-emerald-400/70 hover:text-emerald-300'
                                      }`}
                                    >
                                      ⚡ Optimized Code
                                    </button>
                                  </div>
                                ) : (
                                  <span>
                                    {struct?.errors?.length > 0 ? 'Corrected & Optimized Code' : 'Optimized Solution Code'}
                                  </span>
                                )}
                                <span className="text-[10px] text-emerald-400/70 font-mono uppercase font-semibold">
                                  ({solLang})
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Toggle Custom Stdin */}
                                <button
                                  type="button"
                                  onClick={() => setShowStdinMap((prev) => ({ ...prev, [msg._id]: !showStdin }))}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                                    showStdin
                                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/40'
                                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                  }`}
                                  title="Provide stdin input for execution"
                                >
                                  stdin
                                </button>

                                {/* Run Code Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRunSolutionCode(solutionCode, solLang, msg._id)}
                                  disabled={isExecuting}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold transition-colors disabled:opacity-50"
                                  title="Execute this code directly using Judge0 / local runner"
                                >
                                  {isExecuting ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin text-emerald-300" /> Running...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 text-emerald-300" /> Run Code
                                    </>
                                  )}
                                </button>

                                {/* Open in Playground Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenInPlayground(solutionCode, solLang)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-[#172636] hover:bg-[#263849] text-sky-300 border border-slate-700/60 font-semibold transition-colors"
                                  title="Open and edit inside Monaco Playground"
                                >
                                  <Terminal className="w-3 h-3 text-sky-400" /> Playground
                                </button>

                                {/* Copy Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(solutionCode, msg._id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 transition-colors font-medium text-slate-300"
                                >
                                  {copiedId === msg._id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" /> Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Stdin Box if toggled */}
                            {showStdin && (
                              <div className="p-2.5 bg-[#070D14] border-b border-emerald-500/20">
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                                  Custom Standard Input (stdin):
                                </label>
                                <textarea
                                  rows={2}
                                  value={stdinMap[msg._id] || ''}
                                  onChange={(e) => setStdinMap((prev) => ({ ...prev, [msg._id]: e.target.value }))}
                                  placeholder="Enter lines or numbers for standard input..."
                                  className="w-full p-2 text-[11px] font-mono rounded bg-[#0A121C] border border-slate-700/80 text-slate-200 focus:outline-none focus:border-emerald-400"
                                />
                              </div>
                            )}

                            {/* Code Snippet */}
                            <pre className="p-4 text-[11px] font-mono text-[#F1F5F9] overflow-x-auto leading-relaxed">
                              <code>{solutionCode}</code>
                            </pre>

                            {/* 4. Actual Execution Output Console (Clearly distinguished from AI expected output) */}
                            {execResult && (
                              <div className="border-t border-slate-800 bg-[#060B11] p-3.5 text-xs font-mono">
                                <div className="flex flex-wrap items-center justify-between pb-1.5 mb-2 border-b border-slate-800 text-[10px] gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        execResult.status === 'Accepted' || execResult.statusCode === 3
                                          ? 'bg-emerald-400'
                                          : 'bg-rose-400'
                                      }`}
                                    />
                                    <span className="font-bold text-slate-200">
                                      Actual Execution Output (Judge0 / Native Execution)
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded font-bold ${
                                        execResult.status === 'Accepted' || execResult.statusCode === 3
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : 'bg-rose-500/20 text-rose-400'
                                      }`}
                                    >
                                      {execResult.status || 'Executed'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-400">
                                    {(execResult.time || execResult.executionTime) && (
                                      <span>Time: {execResult.time || execResult.executionTime}</span>
                                    )}
                                    {execResult.memory && <span>Mem: {execResult.memory}</span>}
                                  </div>
                                </div>

                                {execResult.compileOutput && (
                                  <div className="mb-2">
                                    <div className="text-[10px] text-rose-400 font-bold uppercase mb-0.5">
                                      Compilation Error:
                                    </div>
                                    <pre className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded whitespace-pre-wrap">
                                      {execResult.compileOutput}
                                    </pre>
                                  </div>
                                )}

                                {execResult.stderr && (
                                  <div className="mb-2">
                                    <div className="text-[10px] text-amber-400 font-bold uppercase mb-0.5">
                                      Runtime Stderr:
                                    </div>
                                    <pre className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded whitespace-pre-wrap">
                                      {execResult.stderr}
                                    </pre>
                                  </div>
                                )}

                                <div>
                                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-0.5">
                                    Standard Output:
                                  </div>
                                  <pre className="text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded whitespace-pre-wrap">
                                    {execResult.stdout || 'Program executed with no standard output.'}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. Sample Input / Output */}
                        {struct?.sampleInputOutput && struct.sampleInputOutput.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] space-y-2 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Sample Input &amp; Expected Output (AI Simulation)
                            </span>
                            <div className="space-y-2 font-mono text-[11px]">
                              {struct.sampleInputOutput.map((io, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-lg bg-black/40 border border-slate-700/60 space-y-1"
                                >
                                  <div className="text-sky-400">
                                    <span className="text-slate-400 select-none mr-1">Input:</span>
                                    {io.input}
                                  </div>
                                  <div className="text-emerald-400">
                                    <span className="text-slate-400 select-none mr-1">Expected Output:</span>
                                    {io.expectedOutput}
                                  </div>
                                  {io.explanation && (
                                    <div className="text-[10px] text-slate-400 font-sans pt-0.5">
                                      {io.explanation}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Dry Run Section */}
                        {struct?.dryRun && struct.dryRun.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] space-y-2 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Dry Run Execution Trace
                            </span>
                            <div className="space-y-1.5 font-mono text-[11px]">
                              {struct.dryRun.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 p-2 rounded bg-black/30 border border-slate-700/40"
                                >
                                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold shrink-0">
                                    Step {step.step || idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="text-slate-300">{step.state}</div>
                                    {step.explanation && (
                                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                                        {step.explanation}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 7. Complexity Analysis Section */}
                        {(struct?.timeComplexity || struct?.spaceComplexity || struct?.complexityComparison) && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636]/60 border border-[#D8E3EA] dark:border-[#263849] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Complexity Analysis
                              </span>
                              {struct.complexityComparison?.analysis && (
                                <span className="text-[10px] text-emerald-400 font-medium">
                                  {struct.complexityComparison.analysis}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {struct.timeComplexity && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px] font-semibold">
                                  <Clock className="w-3 h-3" />
                                  Time: {struct.timeComplexity}
                                </span>
                              )}
                              {struct.spaceComplexity && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-semibold">
                                  <Cpu className="w-3 h-3" />
                                  Space: {struct.spaceComplexity}
                                </span>
                              )}
                            </div>

                            {/* Before vs After Complexity Comparison */}
                            {struct.complexityComparison && (
                              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                                <div className="p-2 rounded bg-black/30 border border-slate-700/50">
                                  <span className="text-[10px] text-slate-400 uppercase font-sans block mb-0.5">
                                    Original
                                  </span>
                                  <div className="text-rose-400">
                                    Time: {struct.complexityComparison.originalTime || 'O(n²)'}
                                  </div>
                                  <div className="text-slate-400">
                                    Space: {struct.complexityComparison.originalSpace || 'O(1)'}
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="text-[10px] text-emerald-400 uppercase font-sans block mb-0.5">
                                    Optimized
                                  </span>
                                  <div className="text-emerald-400 font-bold">
                                    Time: {struct.complexityComparison.optimizedTime || 'O(n)'}
                                  </div>
                                  <div className="text-emerald-300">
                                    Space: {struct.complexityComparison.optimizedSpace || 'O(1)'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 8. Verified Test Cases Section */}
                        {struct?.testCases && struct.testCases.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Verified Test Cases (Normal, Boundary, Edge)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                              {struct.testCases.map((tc, idx) => (
                                <div key={idx} className="p-2 rounded bg-black/40 border border-slate-700/50">
                                  <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
                                    <span>{tc.description || tc.type}</span>
                                    <span className="uppercase text-[9px] px-1 rounded bg-slate-700/50">
                                      {tc.type || 'test'}
                                    </span>
                                  </div>
                                  <div className="text-[#38BDF8] truncate">Input: {tc.input}</div>
                                  <div className="text-emerald-400 truncate">Expected: {tc.expectedOutput}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover border border-[#12D6C5]/40 shrink-0 mt-1"
                    />
                  )}
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-center gap-3 text-xs text-[#089E9A] dark:text-[#12D6C5] font-medium animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analyzing problem statement, debugging code &amp; generating optimal solution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Matching Reference Image 5) */}
        <div className="p-3 border-t border-[#D8E3EA] dark:border-[#263849] bg-slate-50/50 dark:bg-[#0D1722]/50">
          {showCodeInput && (
            <div className="mb-2">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-slate-400">
                <span>Code Attachment Field ({language})</span>
                <span>Press Ctrl + Enter to send</span>
              </div>
              <textarea
                rows={5}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Paste code snippet to debug, optimize, or analyze..."
                className="w-full p-3 font-mono text-xs rounded-xl bg-white dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
              />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2.5 rounded-xl transition-colors mb-0.5 shrink-0 ${
                showCodeInput
                  ? 'bg-[#12D6C5]/20 text-[#089E9A] dark:text-[#12D6C5]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172636]'
              }`}
              title="Toggle dedicated code attachment box"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="flex-1 relative flex items-center">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message or code (Press Enter to send, Shift + Enter for new line)..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9] resize-none overflow-y-auto leading-relaxed max-h-44 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={sending || (!inputMessage.trim() && !inputCode.trim())}
              size="sm"
              className="p-2.5 rounded-xl shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
