import React, { useState, useEffect } from 'react';
import { QuizSession, Question, QuizResults } from '../types';

interface QuizEngineProps {
  session: QuizSession;
  onComplete: (session: QuizSession) => void; // Updated to match App.tsx expectation
  onExit: () => void;
  onToggleBookmark?: (question: Question) => void;
  bookmarkedIds?: string[];
  isReview?: boolean;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ 
  session, 
  onComplete, 
  onExit, 
  onToggleBookmark,
  bookmarkedIds = [],
  isReview = false
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(session.userAnswers || {});
  const [timeLeft, setTimeLeft] = useState((session.durationInMinutes || 60) * 60);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReview) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReview]);

  const handleSubmit = () => {
    if (isReview) {
      onExit();
      return;
    }
    setIsSubmitting(true);
  };

  const confirmSubmit = () => {
    // Pass the updated session back to App.tsx
    const updatedSession = {
      ...session,
      userAnswers: answers,
      completed: true,
      timeTaken: (session.durationInMinutes || 60) * 60 - timeLeft
    };
    onComplete(updatedSession);
  };

  const handleBackClick = () => {
    if (isReview) {
      onExit();
    } else {
      setIsExiting(true);
    }
  };

  const handleSelect = (option: string) => {
    if (isReview) return;
    const qId = session.questions[currentIdx].id;
    if (answers[qId]) return;

    setAnswers(prev => ({ ...prev, [qId]: option }));
    
    if (currentIdx < session.questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 450);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = session.questions[currentIdx];
  const userAns = answers[currentQ.id];
  const isBookmarked = bookmarkedIds.includes(currentQ.id);

  return (
    <div className="flex flex-col lg:flex-row gap-3 max-w-[1000px] mx-auto px-1 md:px-4 py-1 animate-fadeIn">
      {/* Navigator Sidebar (Desktop Only) */}
      <div className="hidden lg:block w-52 shrink-0 space-y-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm sticky top-20">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
             <div className="text-center">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Left</span>
                <span className={`text-xl font-mono font-black ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{formatTime(timeLeft)}</span>
             </div>
             <div className="text-center border-l pl-4">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-xl font-black text-slate-900">{currentIdx + 1}<span className="text-slate-300 text-sm">/{session.questions.length}</span></span>
             </div>
          </div>

          <div className="mb-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">प्रश्न सूची (Navigator)</h3>
             <div className="grid grid-cols-5 gap-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {session.questions.map((q, idx) => {
                  const isAns = !!answers[q.id];
                  const isCurrent = idx === currentIdx;
                  let dotClass = "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all ";
                  
                  if (isReview) {
                    const correct = answers[q.id] === q.correctAnswer;
                    const skipped = !answers[q.id];
                    if (correct) dotClass += "bg-emerald-500 text-white";
                    else if (skipped) dotClass += "bg-slate-100 text-slate-300";
                    else dotClass += "bg-rose-500 text-white";
                  } else {
                    if (isCurrent) dotClass += "ring-2 ring-blue-500 bg-blue-600 text-white shadow-lg scale-110 z-10";
                    else if (isAns) dotClass += "bg-slate-800 text-white";
                    else dotClass += "bg-slate-50 text-slate-400 hover:bg-slate-100";
                  }

                  return (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentIdx(idx)}
                      className={dotClass}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
             </div>
          </div>

          {!isReview && (
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow space-y-3">
        {/* Mobile Header */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 p-2 flex items-center justify-between lg:hidden sticky top-0 z-40">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
                 {currentIdx + 1}
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Q {currentIdx + 1} / {session.questions.length}</span>
                 {!isReview && <span className={`font-mono text-[10px] font-bold mt-0.5 ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>{formatTime(timeLeft)}</span>}
              </div>
           </div>
           {!isReview && (
             <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-100">SUBMIT</button>
           )}
           <button onClick={handleBackClick} className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>

        <div className="bg-white p-2.5 md:p-5 rounded-[1.5rem] shadow-xl border border-slate-100 animate-fadeIn relative overflow-hidden min-h-[400px] flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50"></div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
               <div className="flex flex-col px-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{currentQ.examName}</span>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">Question Details</h2>
               </div>
               <button 
                  onClick={() => onToggleBookmark?.(currentQ)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isBookmarked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                  <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
               </button>
            </div>

            <div className="bg-slate-50/50 p-3 md:p-5 rounded-2xl border border-slate-100 mb-3 shadow-inner overflow-hidden relative">
               <div className="absolute top-0 right-0 p-3 opacity-5 font-black text-5xl pointer-events-none select-none">RAJ</div>
               {currentQ.question.split('\n').map((line, i) => {
                 const hasSeparator = line.includes(' || ');
                 if (hasSeparator) {
                   const [left, right] = line.split(' || ');
                   const isHeader = line.includes('सूची-');
                   return (
                     <div key={i} className={`grid grid-cols-2 relative ${isHeader ? 'bg-slate-800 text-white rounded-t-xl mb-0 font-black shadow-md' : 'border-b border-l border-r border-slate-200 last:rounded-b-xl'}`}>
                       <div className={`p-3 px-6 hindi-text text-sm md:text-base border-r border-slate-200 flex items-center ${isHeader ? 'text-white border-slate-700/50 uppercase' : 'text-slate-700 bg-white font-bold'}`}>
                         {left.trim()}
                       </div>
                       <div className={`p-3 px-6 hindi-text text-sm md:text-base flex items-center ${isHeader ? 'text-white uppercase' : 'text-slate-700 bg-white font-bold'}`}>
                         {right.trim()}
                       </div>
                     </div>
                   );
                 }
                 const isKoot = line.includes('कूट') || line.includes('Codes') || line.includes('चयन');
                 const isStatement = /^\d+\./.test(line.trim());
                 return (
                   <div key={i} className="relative">
                     <p className={`text-base md:text-lg font-bold hindi-text leading-relaxed text-slate-800 py-1.5 ${isKoot ? 'text-blue-700 border-t border-dashed border-slate-300 mt-4 bg-blue-50/40 rounded-xl p-4' : ''} ${isStatement ? 'pl-10' : ''}`}>
                       {isStatement && <span className="absolute left-1 top-3.5 w-6 h-6 bg-blue-100 text-blue-600 text-[12px] flex items-center justify-center rounded-full font-black border border-blue-200 shadow-sm">●</span>}
                       {line}
                     </p>
                   </div>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => {
                const isCorrect = isReview && currentQ.correctAnswer === key;
                const isSelected = userAns === key;
                const isWrongSelection = isReview && isSelected && !isCorrect;
                const isLocked = !!userAns && !isReview;

                let cardClasses = "relative w-full p-3.5 md:p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left outline-none group ";
                
                if (isReview) {
                  if (isCorrect) cardClasses += "bg-emerald-50 border-emerald-500 shadow-sm ring-4 ring-emerald-50/50";
                  else if (isWrongSelection) cardClasses += "bg-rose-50 border-rose-500 shadow-sm";
                  else cardClasses += "bg-white border-slate-100 opacity-60";
                } else {
                  if (isSelected) cardClasses += "bg-slate-100 border-blue-600 shadow-md ring-1 ring-blue-600/10 z-10";
                  else if (isLocked) cardClasses += "bg-slate-50 border-transparent opacity-40 grayscale-[50%]";
                  else cardClasses += "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm active:scale-[0.99]"; 
                }

                return (
                  <button 
                    key={key} 
                    disabled={isLocked || isReview}
                    onClick={() => handleSelect(key)} 
                    className={cardClasses}
                  >
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-base md:text-lg shrink-0 transition-all ${
                      isReview ? (isCorrect ? 'bg-emerald-600 text-white shadow-lg' : isWrongSelection ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400') :
                      isSelected ? 'bg-blue-600 text-white shadow-inner' : 
                      'bg-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-200'
                    }`}>
                      {key}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`hindi-text font-bold text-sm md:text-base tracking-tight leading-snug ${isSelected ? 'text-blue-700 font-black' : 'text-slate-800'}`}>{currentQ.options[key]}</p>
                    </div>
                    {/* Removed selection checkmark to keep options uniform */}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Controls: Previous, Next, Submit */}
          <div className="mt-6 pt-3 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-3 gap-3">
             <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} 
                disabled={currentIdx === 0}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-30 hover:bg-slate-200 transition-all active:scale-[0.95] group"
             >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                Previous
             </button>

             <button 
                onClick={() => setCurrentIdx(prev => Math.min(session.questions.length - 1, prev + 1))} 
                disabled={currentIdx === session.questions.length - 1}
                className="flex items-center justify-center gap-3 py-5 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-30 hover:bg-blue-700 transition-all active:scale-[0.95] shadow-xl shadow-blue-100 group"
             >
                Next
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
             </button>

             {!isReview && (
               <button 
                  onClick={handleSubmit}
                  className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 py-5 px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all active:scale-[0.95] shadow-xl shadow-emerald-100"
               >
                  Submit Quiz
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Custom Exit Modal */}
      {isExiting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl space-y-8 text-center border-t-8 border-rose-600">
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Exit Quiz?</h3>
               <p className="text-slate-500 font-medium whitespace-normal hindi-text">आपका प्रोग्रेस सेव नहीं होगा। क्या आप वाकई बाहर निकलना चाहते हैं?</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={onExit} className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-rose-100">Yes, Exit Now</button>
              <button onClick={() => setIsExiting(false)} className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all">Wait, Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl space-y-8 text-center border-t-8 border-emerald-600">
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Submit Test?</h3>
               <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl mb-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                     <span>Attempted</span>
                     <span className="text-slate-900">{Object.keys(answers).length} / {session.questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                     <span>Unattempted</span>
                     <span className="text-rose-600">{session.questions.length - Object.keys(answers).length}</span>
                  </div>
               </div>
               <p className="text-slate-500 font-medium whitespace-normal hindi-text">क्या आप अपना टेस्ट सबमिट करना चाहते हैं? इसके बाद आप उत्तर नहीं बदल सकेंगे।</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={confirmSubmit} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-100">Yes, Submit Final</button>
              <button onClick={() => setIsSubmitting(false)} className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all">No, Review Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizEngine;
