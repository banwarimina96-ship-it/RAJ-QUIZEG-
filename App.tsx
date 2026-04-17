
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import QuizEngine from './components/QuizEngine';
import ScoreCard from './components/ScoreCard';
import { 
  AppView, 
  AuthSubView,
  QuizSession, 
  QuizType, 
  QuizResults,
  Question,
  User,
  QuestionDifficulty
} from './types';
import { 
  TOPIC_GROUPS,
  TopicGroup,
  MARKING_SCHEME,
  OFFICIAL_EXAMS
} from './constants.ts';
import { fetchPYQs } from './services/geminiService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.AUTH);
  const [authStep, setAuthStep] = useState<AuthSubView>(AuthSubView.CHOICE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editProfilePic, setEditProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [lastResults, setLastResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TopicGroup | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedSubtopicIdx, setSelectedSubtopicIdx] = useState<number>(-1);
  
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [prefetchActive, setPrefetchActive] = useState(false);
  const selectedDifficulty = QuestionDifficulty.HARD; // Hardcoded to 2025 Trend level

  useEffect(() => {
    const savedUserPhone = localStorage.getItem('rajquiz_currentUser');
    if (savedUserPhone) {
      const users = JSON.parse(localStorage.getItem('rajquiz_users') || '{}');
      const userData = users[savedUserPhone];
      if (userData) {
        loginUser(savedUserPhone, userData.name, userData.profilePic);
      } else {
        setView(AppView.AUTH);
      }
    } else {
      setView(AppView.AUTH);
    }
  }, []);

  const loginUser = (userPhone: string, userName?: string, profilePic?: string) => {
    setIsLoggedIn(true);
    setPhone(userPhone);
    const userData: User = { phone: userPhone, name: userName, profilePic };
    setCurrentUser(userData);
    setEditName(userName || '');
    setEditProfilePic(profilePic || null);
    setView(AppView.HOME);
    
    const progressKey = `rajquiz_progress_${userPhone}`;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      try { setUserProgress(JSON.parse(savedProgress)); } catch (e) { console.error(e); }
    }

    const bookmarkKey = `rajquiz_bookmarks_${userPhone}`;
    const savedBookmarks = localStorage.getItem(bookmarkKey);
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.error(e); }
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('rajquiz_users') || '{}');
    const updatedUser = { 
      ...users[currentUser.phone], 
      name: editName, 
      profilePic: editProfilePic 
    };
    users[currentUser.phone] = updatedUser;
    
    localStorage.setItem('rajquiz_users', JSON.stringify(users));
    setCurrentUser({ ...currentUser, name: editName, profilePic: editProfilePic || '' });
    setView(AppView.PROFILE);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512 * 1024) {
        alert("कृपया छोटी फोटो चुनें (Max 500KB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProgress = (testId: string, percentage: number) => {
    const progressKey = `rajquiz_progress_${phone}`;
    const currentProg = userProgress[testId] || 0;
    const newProgress = { ...userProgress, [testId]: Math.max(currentProg, percentage) };
    setUserProgress(newProgress);
    localStorage.setItem(progressKey, JSON.stringify(newProgress));
  };

  const toggleBookmark = (question: Question) => {
    const isBookmarked = bookmarks.some(b => b.id === question.id);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.id !== question.id);
    } else {
      newBookmarks = [...bookmarks, question];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem(`rajquiz_bookmarks_${phone}`, JSON.stringify(newBookmarks));
  };

  const [prefetchProgress, setPrefetchProgress] = useState(0);

  const navigateTo = (newView: AppView) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const prefetchQuizData = useCallback(async (type: QuizType, title: string, options: any = {}) => {
    const diff = options.difficulty || selectedDifficulty;
    const testId = options.testId || `${type}_${title.replace(/\s+/g, '_')}_${diff}`;
    const cacheKey = `rajquiz_cache_${testId}`;
    if (localStorage.getItem(cacheKey)) return true;

    try {
      const questions = await fetchPYQs({ ...options, count: options.count || 50, difficulty: diff });
      localStorage.setItem(cacheKey, JSON.stringify(questions));
      return true;
    } catch (e) {
      console.warn(`Prefetch failed for ${title}:`, e);
      return false;
    }
  }, [selectedDifficulty]);

  useEffect(() => {
    if (!isLoggedIn || prefetchActive) return;

    const runPrefetcher = async () => {
      setPrefetchActive(true);
      
      const priorityTasks = [];
      
      // Expanded prefetch list for true instant feel
      // ALL 100 Mixed Mocks
      for (let i = 1; i <= 100; i++) {
        priorityTasks.push({ 
          type: QuizType.MIX, 
          title: `Mixed Mock Set #${i}`, 
          options: { count: 50, isMix: true, testNumber: i, testId: `mix_set_${i}` } 
        });
      }

      // First 10 tests of EVERY subtopic in EVERY major Topic Group
      TOPIC_GROUPS.forEach((group) => {
        group.subtopics.forEach((sub, sIdx) => {
          for (let tNum = 1; tNum <= 10; tNum++) {
            priorityTasks.push({
              type: QuizType.TOPIC,
              title: `${sub} (Set ${tNum})`,
              options: { count: 50, topic: sub, subject: group.name, testId: `topic_${group.id}_${sIdx}_test${tNum}`, testNumber: tNum }
            });
          }
        });
      });

      // ALL Official Exams
      OFFICIAL_EXAMS.forEach(exam => {
        priorityTasks.push({
          type: QuizType.EXAM,
          title: exam.name,
          options: { count: exam.count, examContext: exam.context, testId: `exam_${exam.name.replace(/\s+/g, '_')}_${exam.year}` }
        });
      });

      // SLOW POOL: Other sets (1-30) for Topic Groups
      // We'll prioritize these less, but still add them
      
      let completed = 0;
      const batchSize = 3; // Fetch 3 concurrently to speed up without hitting rate limits
      for (let i = 0; i < priorityTasks.length; i += batchSize) {
        const batch = priorityTasks.slice(i, i + batchSize);
        await Promise.all(batch.map(t => prefetchQuizData(t.type, t.title, t.options)));
        completed += batch.length;
        setPrefetchProgress(Math.round((completed / priorityTasks.length) * 100));
        await new Promise(r => setTimeout(r, 1200)); // Delay between batches
      }
      setPrefetchActive(false);
    };

    runPrefetcher();
  }, [isLoggedIn, prefetchActive, prefetchQuizData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('rajquiz_users') || '{}');
    const user = users[phone];
    if (!user) { 
      setAuthStep(AuthSubView.SIGNUP);
      setLoginError(''); 
      return; 
    }
    if (user.password === password) {
      localStorage.setItem('rajquiz_currentUser', phone);
      loginUser(phone, user.name, user.profilePic);
    } else { 
      setLoginError("गलत पासवर्ड।"); 
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    if (password !== confirmPassword) {
      setLoginError("पासवर्ड मैच नहीं हो रहे हैं।");
      return;
    }

    const users = JSON.parse(localStorage.getItem('rajquiz_users') || '{}');
    if (users[phone]) {
      setLoginError("यह नंबर पहले से रजिस्टर है।");
      setAuthStep(AuthSubView.LOGIN);
      return;
    }
    users[phone] = { password, name: '', profilePic: '' };
    localStorage.setItem('rajquiz_users', JSON.stringify(users));
    localStorage.setItem('rajquiz_currentUser', phone);
    loginUser(phone, '', '');
  };

  // CACHE-FIRST INSTANT LOADING STRATEGY
  const startQuiz = useCallback(async (type: QuizType, title: string, options: any = {}) => {
    const diff = options.difficulty || selectedDifficulty;
    const testId = options.testId || `${type}_${title.replace(/\s+/g, '_')}_${diff}`;
    const cacheKey = `rajquiz_cache_${testId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const questions = JSON.parse(cachedData);
        setActiveSession({
          type, title, questions, currentQuestionIndex: 0, userAnswers: {}, 
          startTime: Date.now(), durationInMinutes: 60, completed: false, testId
        } as any);
        navigateTo(AppView.QUIZ_ACTIVE);
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    setLoading(true);
    try {
      const questions = await fetchPYQs({ ...options, count: options.count || 50, difficulty: diff });
      try {
        localStorage.setItem(cacheKey, JSON.stringify(questions));
      } catch (e) {
        console.warn("Local storage full, caching skipped");
      }
      setActiveSession({
        type, title, questions, currentQuestionIndex: 0, userAnswers: {}, 
        startTime: Date.now(), durationInMinutes: 60, completed: false, testId
      } as any);
      setLoading(false);
      navigateTo(AppView.QUIZ_ACTIVE);
    } catch (err) {
      console.error(err);
      alert("AI जेनरेटर वर्तमान में व्यस्त है। कृपया 10 सेकंड बाद पुन: प्रयास करें। (AI is busy, retry in 10s)");
      setLoading(false);
    }
  }, [navigateTo, selectedDifficulty]);

  const onQuizComplete = (session: any) => {
    if (!session || !session.questions) {
      console.error("Invalid session object passed to onQuizComplete:", session);
      navigateTo(AppView.HOME);
      return;
    }
    let score = 0, correct = 0, incorrect = 0, skipped = 0, unattempted = 0;
    session.questions.forEach((q: any) => {
      const ans = session.userAnswers ? session.userAnswers[q.id] : null;
      if (!ans) { score += MARKING_SCHEME.UNATTEMPTED; unattempted++; }
      else if (ans === 'E') skipped++;
      else if (ans === q.correctAnswer) { score += MARKING_SCHEME.CORRECT; correct++; }
      else { score += MARKING_SCHEME.WRONG; incorrect++; }
    });
    
    const positiveMarks = correct * MARKING_SCHEME.CORRECT;
    const negativeMarks = Math.abs((incorrect + unattempted) * MARKING_SCHEME.WRONG);

    if (session.testId) saveProgress(session.testId, (score / (session.questions.length * 2)) * 100);
    const formatDetailedTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    setLastResults({ 
      score, 
      correctCount: correct, 
      incorrectCount: incorrect, 
      skippedCount: skipped, 
      unattemptedCount: unattempted, 
      totalQuestions: session.questions.length, 
      session, 
      timeTaken: session.timeTaken ? formatDetailedTime(session.timeTaken) : "60:00",
      positiveMarks,
      negativeMarks
    } as any);
    navigateTo(AppView.SCORECARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('rajquiz_currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigateTo(AppView.AUTH);
  };

  const renderBackButton = (target: AppView = AppView.HOME) => (
    <button onClick={() => navigateTo(target)} className="mb-6 flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
      Back
    </button>
  );

  return (
    <Layout 
      onHomeClick={() => navigateTo(AppView.HOME)} 
      onTopicTestsClick={() => navigateTo(AppView.QUIZ_TOPIC_MENU)}
      onExamPapersClick={() => navigateTo(AppView.EXAM_MENU)}
      onBookmarksClick={() => navigateTo(AppView.BOOKMARKS)}
      onProfileClick={() => navigateTo(AppView.PROFILE)} 
      onLogout={handleLogout}
      isLoggedIn={isLoggedIn}
      userName={currentUser?.name}
      profilePic={currentUser?.profilePic}
    >
      {loading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fadeIn text-center p-8">
          <div className="w-20 h-20 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-black uppercase text-slate-900 mb-2 tracking-tighter italic">क्विज़ तैयार हो रही है...</h2>
          <p className="text-blue-600 font-bold uppercase text-[10px] tracking-[0.3em]">Building Unique Data Pool</p>
        </div>
      ) : (
        <>
          {view === AppView.AUTH && (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fadeIn border border-slate-100">
                {authStep === AuthSubView.CHOICE ? (
                  <div className="text-center space-y-12 py-6">
                    <div className="space-y-2">
                      <h2 className="text-5xl font-black text-blue-600 italic tracking-tighter">RAJQUIZER.</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Master RPSC & RSSB PYQs</p>
                    </div>
                    <div className="space-y-4">
                      <button onClick={() => setAuthStep(AuthSubView.LOGIN)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">LOGIN</button>
                      <button onClick={() => setAuthStep(AuthSubView.SIGNUP)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-slate-800 transition-all active:scale-95">SIGN UP</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={authStep === AuthSubView.LOGIN ? handleLogin : handleSignup} className="space-y-5">
                    <div className="flex items-center gap-4 mb-8">
                       <button type="button" onClick={() => { setAuthStep(AuthSubView.CHOICE); setLoginError(''); }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 border border-slate-100 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg></button>
                       <h3 className="text-3xl font-black tracking-tight">{authStep === AuthSubView.LOGIN ? 'Login' : 'Signup'}</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Mobile Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98xxxxxx00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold transition-all" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold transition-all" required />
                      </div>
                      {authStep === AuthSubView.SIGNUP && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Confirm Password</label>
                          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold transition-all" required />
                        </div>
                      )}
                    </div>
                    {loginError && <p className="text-rose-600 text-[11px] font-black uppercase">{loginError}</p>}
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg mt-4 shadow-xl active:scale-95 transition-all">{authStep === AuthSubView.LOGIN ? 'LOG IN' : 'JOIN NOW'}</button>
                  </form>
                )}
              </div>
            </div>
          )}
          
          {view === AppView.HOME && (
             <div className="space-y-16 animate-fadeIn py-10 max-w-6xl mx-auto px-4 text-center">
               <div className="space-y-4">
                 <h1 className="text-4xl md:text-6xl font-black text-blue-600 hindi-text tracking-tight leading-none">सर्वं सम्भाव्यते त्वयि।</h1>
                  
                  <h3 className="text-xl md:text-3xl font-black text-slate-400 uppercase italic tracking-widest leading-none mt-1">you can do anything</h3>
                 <p className="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mt-8">Premium Mock Tests • Official RPSC & RSSB Standards</p>
                 
                 {false && (
                   <div className="flex flex-col items-center gap-2 mt-8 animate-fadeIn">
                     <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Preparing Your 10,000+ Question Vault... {prefetchProgress}%</span>
                     </div>
                     <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${prefetchProgress}%` }}></div>
                     </div>
                   </div>
                 )}
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { title: "Mixed Mocks", onClick: () => navigateTo(AppView.QUIZ_MIX_MENU), gradient: "from-slate-800 to-slate-950", desc: "200 Sets • 10k+ PYQ Pool" },
                   { title: "Topic Wise", onClick: () => navigateTo(AppView.QUIZ_TOPIC_MENU), gradient: "from-blue-600 to-indigo-800", desc: "Subject Focus • Detailed Maps" },
                   { title: "Exam Papers", onClick: () => navigateTo(AppView.EXAM_MENU), gradient: "from-emerald-600 to-teal-800", desc: "SI 2021 & Official Vault" }
                 ].map(card => (
                   <button key={card.title} onClick={card.onClick} className={`p-12 rounded-[3rem] text-left bg-gradient-to-br ${card.gradient} text-white shadow-xl hover:-translate-y-2 transition-all group active:scale-[0.98]`}>
                     <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-1 uppercase tracking-tight">{card.title}</h3>
                        <p className="text-white/60 font-bold text-sm mb-8">{card.desc}</p>
                        <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Explore <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></div>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
          )}

          {view === AppView.QUIZ_MIX_MENU && (
             <div className="max-w-4xl mx-auto px-4">
                {renderBackButton()}
                <div className="mb-10">
                   <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Mixed <span className="text-blue-600">Practice</span></h2>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">100 HIGH-LEVEL SETS • 2025 TREND PATTERN</p>
                </div>
                <div className="space-y-4 pb-20 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                   {Array.from({ length: 100 }).map((_, i) => {
                     const testId = `mix_set_${i + 1}`;
                     const progress = userProgress[testId] || 0;
                     const isAttempted = progress > 0;
                     const isCached = !!localStorage.getItem(`rajquiz_cache_${testId}`);
                     
                     return (
                        <button key={i} onClick={() => startQuiz(QuizType.MIX, `Mixed Mock Set #${i + 1}`, { count: 50, isMix: true, testNumber: i + 1, testId })} className={`w-full bg-white p-6 rounded-[1.5rem] border-2 ${isAttempted ? 'border-emerald-200 shadow-emerald-50' : isCached ? 'border-blue-100' : 'border-slate-100'} hover:border-blue-600 transition-all text-left flex items-center justify-between group active:scale-[0.99] relative overflow-hidden`}>
                           <div className="flex gap-6 items-center flex-1">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${isAttempted ? 'bg-emerald-50 text-emerald-600' : isCached ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                                 {i + 1}
                              </div>
                              <div className="flex-1">
                                 <h4 className="text-lg font-black text-slate-800 whitespace-normal break-words">Practice Set #{i + 1}</h4>
                                 <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">50 Questions</span>
                                    {isCached && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                                      Instant Ready
                                    </span>}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6 shrink-0 ml-4">
                              {isAttempted ? (
                                <div className="flex items-center gap-2">
                                   <div className="text-emerald-600 font-black text-lg">{Math.round(progress)}%</div>
                                   <span className="text-emerald-500 text-xl font-bold">✅</span>
                                </div>
                              ) : (
                                <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                              )}
                           </div>
                        </button>
                     );
                   })}
                </div>
             </div>
          )}

          {view === AppView.QUIZ_SUBTOPIC_MENU && selectedGroup && (
             <div className="max-w-5xl mx-auto px-4">
                {renderBackButton(AppView.QUIZ_TOPIC_MENU)}
                <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter">{selectedGroup.name}</h2>
                <div className="space-y-4 pb-20">
                   {selectedGroup.subtopics.map((sub, i) => {
                     const isDoneSet1 = (userProgress[`topic_${selectedGroup.id}_${i}_test1`] || 0) > 0;
                     const isDoneSet2 = (userProgress[`topic_${selectedGroup.id}_${i}_test2`] || 0) > 0;
                     const isAtLeastOneDone = isDoneSet1 || isDoneSet2;

                     return (
                       <button key={i} onClick={() => { setSelectedSubtopic(sub); setSelectedSubtopicIdx(i); navigateTo(AppView.QUIZ_TOPIC_TESTS_MENU); }} className={`w-full bg-white p-7 rounded-[1.25rem] border-2 ${isAtLeastOneDone ? 'border-emerald-200 shadow-sm' : 'border-slate-100'} hover:border-blue-600 transition-all text-left flex items-center justify-between group gap-6`}>
                          <div className="flex items-center gap-5 flex-1 min-w-0">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isAtLeastOneDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {i + 1}
                             </div>
                             <span className="text-lg font-bold hindi-text text-slate-700 leading-snug whitespace-normal break-words flex-1">{sub}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {isAtLeastOneDone && <span className="text-emerald-500 text-xl font-bold">✅</span>}
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-1 transition-transform">Solve →</span>
                          </div>
                       </button>
                     );
                   })}
                </div>
             </div>
          )}

          {view === AppView.QUIZ_TOPIC_TESTS_MENU && selectedSubtopic && selectedGroup && (
            <div className="max-w-4xl mx-auto px-4">
              {renderBackButton(AppView.QUIZ_SUBTOPIC_MENU)}
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tight hindi-text whitespace-normal break-words">{selectedSubtopic}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Select a 50-question test set</p>
              <div className="space-y-6 pb-20">
                {[1, 2, 3].map(num => {
                  const tId = `topic_${selectedGroup.id}_${selectedSubtopicIdx}_test${num}`;
                  const progress = userProgress[tId] || 0;
                  const isDone = progress > 0;

                  return (
                    <button key={num} onClick={() => startQuiz(QuizType.TOPIC, `${selectedSubtopic} (Set ${num})`, { count: 50, topic: selectedSubtopic, subject: selectedGroup.name, testId: tId, testNumber: num })} className={`w-full bg-white p-5 rounded-[1.25rem] border-2 ${isDone ? 'border-emerald-200' : 'border-slate-100'} hover:border-blue-600 transition-all group flex items-center justify-between active:scale-[0.99]`}>
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shrink-0 ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                           {num}
                        </div>
                        <div className="text-left">
                           <h3 className="text-lg font-black text-slate-800 mb-0.5">Practice Paper {num}</h3>
                           <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.1em]">50 Verified Selection-Level Questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                         {isDone ? (
                           <div className="flex items-center gap-2">
                              <span className="text-emerald-600 font-black text-base">{Math.round(progress)}%</span>
                              <span className="text-emerald-500 text-xl font-bold">✅</span>
                           </div>
                         ) : (
                           <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest group-hover:underline">Start →</span>
                         )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === AppView.EXAM_MENU && (
             <div className="max-w-6xl mx-auto px-4">
                {renderBackButton()}
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">Official <span className="text-blue-600">Exam Vault</span></h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                   {OFFICIAL_EXAMS.map((exam, i) => {
                      const tId = `exam_${exam.name.replace(/\s+/g, '_')}_${exam.year}`;
                      const progress = userProgress[tId] || 0;
                      const isDone = progress > 0;
                      return (
                        <button key={i} onClick={() => startQuiz(QuizType.EXAM, exam.name, { count: exam.count || 50, examContext: exam.context, testId: tId })} className={`bg-white p-6 rounded-2xl border-2 ${isDone ? 'border-emerald-200 shadow-emerald-50' : 'border-slate-100'} shadow-sm hover:shadow-xl transition-all text-left flex flex-col justify-between group h-full active:scale-[0.98]`}>
                           <div>
                              <div className="flex justify-between mb-3">
                                 <div className="flex items-center gap-2">
                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black text-[9px] uppercase">{exam.tag}</span>
                                    {isDone && <span className="text-emerald-500 text-lg font-bold">✅</span>}
                                 </div>
                                 <span className="text-slate-300 font-bold text-sm">{exam.year}</span>
                              </div>
                              <h3 className="text-xl font-black mb-1 leading-tight text-slate-800 break-words">{exam.name}</h3>
                              {isDone && <div className="text-emerald-600 font-black text-xs mb-3">Score: {Math.round(progress)}%</div>}
                           </div>
                           <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest pt-4 group-hover:underline">Start Now →</div>
                        </button>
                      );
                   })}
                </div>
             </div>
          )}

          {/* All other persistent app views maintained ... */}
          {view === AppView.QUIZ_ACTIVE && activeSession && (
            <QuizEngine session={activeSession} onComplete={onQuizComplete} onExit={() => navigateTo(AppView.HOME)} onToggleBookmark={toggleBookmark} bookmarkedIds={bookmarks.map(b => b.id)} />
          )}

          {view === AppView.SCORECARD && lastResults && (
            <ScoreCard results={lastResults} onReview={() => navigateTo(AppView.REVIEW)} onRevealAll={() => navigateTo(AppView.REVEAL_ALL)} onNextTest={() => navigateTo(AppView.HOME)} onBackHome={() => navigateTo(AppView.HOME)} />
          )}

          {view === AppView.REVEAL_ALL && lastResults && (
            <div className="max-w-4xl mx-auto px-4 animate-fadeIn pb-20">
               <div className="sticky top-20 bg-white/90 backdrop-blur-md z-40 py-6 border-b border-slate-100 flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Answer <span className="text-amber-500">Guide</span></h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{lastResults.session.title}</p>
                  </div>
                  <button onClick={() => navigateTo(AppView.SCORECARD)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest">Close</button>
               </div>
               <div className="space-y-8">
                  {lastResults.session.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/10"></div>
                       <div className="flex items-center gap-3 mb-6">
                          <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">{idx + 1}</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q.examName}</span>
                       </div>
                       <h3 className="text-xl font-bold mb-8 hindi-text text-slate-800 whitespace-normal break-words">{q.question}</h3>
                       <div className="grid gap-3">
                          {['A','B','C','D','E'].map(key => {
                             const isCorrect = q.correctAnswer === key;
                             return (
                               <div key={key} className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-50 opacity-60'}`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{key}</div>
                                  <span className="hindi-text font-bold text-slate-800 whitespace-normal break-words">{q.options[key as 'A'|'B'|'C'|'D'|'E']}</span>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {view === AppView.REVIEW && lastResults && (
            <QuizEngine session={lastResults.session} onComplete={() => navigateTo(AppView.HOME)} onExit={() => navigateTo(AppView.SCORECARD)} isReview={true} onToggleBookmark={toggleBookmark} bookmarkedIds={bookmarks.map(b => b.id)} />
          )}

          {view === AppView.QUIZ_TOPIC_MENU && (
             <div className="max-w-5xl mx-auto px-4">
                {renderBackButton()}
                <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter">Topic <span className="text-blue-600">Specialist</span></h2>
                <div className="grid sm:grid-cols-2 gap-6 pb-12">
                   {TOPIC_GROUPS.map(group => (
                     <button key={group.id} onClick={() => { setSelectedGroup(group); navigateTo(AppView.QUIZ_SUBTOPIC_MENU); }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group">
                       <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors whitespace-normal break-words">{group.name}</h3>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{group.subtopics.length} Expert Modules</p>
                     </button>
                   ))}
                </div>
             </div>
          )}

          {view === AppView.PROFILE && (
            <div className="max-w-2xl mx-auto px-4">
              {renderBackButton()}
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-lg">
                    {currentUser?.profilePic ? (
                      <img src={currentUser.profilePic} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    )}
                  </div>
                  <button onClick={() => navigateTo(AppView.EDIT_PROFILE)} className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full shadow-md text-white border-2 border-white hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                </div>
                
                <h3 className="text-3xl font-black mb-1 text-slate-900">{currentUser?.name || 'राजस्थान अभ्यर्थी'}</h3>
                <p className="text-slate-400 font-bold mb-10 tracking-widest">{phone}</p>

                <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Solved</span>
                     <span className="text-2xl font-black text-slate-900">{Object.keys(userProgress).length}</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bookmarked</span>
                     <span className="text-2xl font-black text-slate-900">{bookmarks.length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                   <button onClick={() => navigateTo(AppView.EDIT_PROFILE)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Update Profile</button>
                   <button onClick={handleLogout} className="w-full py-4 text-rose-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-50 transition-all">Logout</button>
                </div>
              </div>
            </div>
          )}

          {view === AppView.EDIT_PROFILE && (
            <div className="max-w-xl mx-auto px-4">
               {renderBackButton(AppView.PROFILE)}
               <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                  <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Edit <span className="text-blue-600">Profile</span></h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                     <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                           <div className="w-24 h-24 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 flex items-center justify-center text-slate-300">
                              {editProfilePic ? (
                                <img src={editProfilePic} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                              )}
                           </div>
                           <div className="absolute inset-0 bg-black/40 text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">Upload</div>
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Profile Picture</span>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Full Name</label>
                           <input 
                             type="text" 
                             value={editName} 
                             onChange={e => setEditName(e.target.value)} 
                             placeholder="Enter your name" 
                             className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold" 
                           />
                        </div>
                        <div className="space-y-1 opacity-60">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Mobile (Verified)</label>
                           <input type="text" value={phone} disabled className="w-full p-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-bold cursor-not-allowed" />
                        </div>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => navigateTo(AppView.PROFILE)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-blue-100">Save Profile</button>
                     </div>
                  </form>
               </div>
            </div>
          )}

          {view === AppView.BOOKMARKS && (
            <div className="max-w-4xl mx-auto px-4">
               {renderBackButton()}
               <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter">Saved <span className="text-rose-600">PYQs</span></h2>
               {bookmarks.length === 0 ? (
                 <div className="bg-white p-24 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                    <span className="text-slate-400 font-black uppercase text-sm tracking-widest">No Saved Items Found</span>
                 </div>
               ) : (
                 <div className="space-y-6 pb-20">
                    {bookmarks.map(q => (
                      <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
                         <button onClick={() => toggleBookmark(q)} className="absolute top-8 right-8 text-rose-600 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg">Remove</button>
                         <h3 className="text-xl font-bold mb-6 hindi-text pr-16 text-slate-800 whitespace-normal break-words">{q.question}</h3>
                         <div className="grid gap-3">
                            {['A','B','C','D'].map(key => (
                               <div key={key} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${q.correctAnswer === key ? 'bg-emerald-50 border-emerald-500' : 'border-slate-50'}`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${q.correctAnswer === key ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{key}</div>
                                  <span className="hindi-text font-bold text-slate-800 whitespace-normal break-words">{q.options[key as 'A'|'B'|'C'|'D']}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
