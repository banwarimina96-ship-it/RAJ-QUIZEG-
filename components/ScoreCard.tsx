
import React from 'react';
import { QuizResults } from '../types.ts';

interface ScoreCardProps {
  results: QuizResults;
  onReview: () => void;
  onRevealAll: () => void;
  onNextTest: () => void;
  onBackHome: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ results, onReview, onRevealAll, onNextTest, onBackHome }) => {
  const maxScore = results.totalQuestions * 2;
  const percentage = Math.max(0, (results.score / maxScore) * 100);
  const isPass = percentage >= 40;
  const isExcellent = percentage >= 70;

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fadeIn">
      <div className="mb-4">
        <button onClick={onBackHome} className="flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          मुख्य मेनू पर वापस जाएं
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 mb-8">
        <div className={`relative py-12 px-6 text-center text-white overflow-hidden ${isExcellent ? 'bg-slate-900 border-b-8 border-amber-500' : isPass ? 'bg-slate-800 border-b-8 border-emerald-500' : 'bg-slate-900 border-b-8 border-rose-500'}`}>
          <div className="relative z-10 space-y-2">
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-4 animate-fadeIn">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white/80">
                {isExcellent ? '🏆 उत्कृष्ट प्रदर्शन - TOPPER LEVEL' : isPass ? '✅ सफल - SELECTION RANGE' : '⚠️ सुधार की आवश्यकता - NEEDS PRACTICE'}
              </span>
            </div>
            
            <div className="flex flex-col items-center">
               <div className="text-7xl md:text-8xl font-black mb-1 tracking-tighter tabular-nums drop-shadow-lg">
                 {results.score.toFixed(2)}
               </div>
               <div className="text-sm font-bold uppercase tracking-widest opacity-60">कुल प्राप्तांक (Total Marks)</div>
            </div>

            <div className="mt-6 flex justify-center gap-8 border-t border-white/10 pt-6">
              <div className="text-center">
                <div className="text-2xl font-black">{results.correctCount}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-50">सही</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-rose-400">{results.incorrectCount}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-50">गलत</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black opacity-60">{results.unattemptedCount}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-50">छोड़े</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-10">
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b pb-2">मार्क्स विवरण (Marks Breakdown)</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-dotted">
                   <span className="text-xs font-bold text-slate-500 uppercase">Gross Positive</span>
                   <span className="text-lg font-black text-emerald-600">+{results.positiveMarks.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-dotted">
                   <span className="text-xs font-bold text-slate-500 uppercase">Negative Penalty</span>
                   <span className="text-lg font-black text-rose-600">-{results.negativeMarks.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-100">
                   <span className="text-xs font-black text-white uppercase italic">Net Result Score</span>
                   <span className="text-xl font-black text-white">{results.score.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center space-y-4 px-4 bg-amber-50/30 rounded-3xl border border-amber-100/50 p-6">
               <div className="relative w-28 h-28">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={isPass ? "#10b981" : "#f43f5e"} strokeWidth="8" strokeDasharray={`${percentage * 2.639} 263.9`} strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-800">{Math.round(percentage)}%</div>
               </div>
               <div>
                  <h5 className="text-lg font-black text-slate-900 mb-1">सटीकता विश्लेषण (Accuracy)</h5>
                  <p className="text-xs font-medium text-slate-500 hindi-text leading-relaxed">
                    {isPass ? "आपका स्कोर चयन सीमा में है। अपनी इस सरेणी को बनाए रखने के लिए अभ्यास जारी रखें।" : "चयन के लिए आपको अपना स्कोर 45% से ऊपर ले जाने की आवश्यकता है।"}
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={onReview} className="group relative overflow-hidden bg-slate-900 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                Interactive Review
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" /></svg>
              </span>
            </button>
            <button onClick={onRevealAll} className="bg-white border-2 border-slate-200 text-slate-700 font-black py-5 rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Answer Key
            </button>
            <button onClick={onNextTest} className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-widest">
              अगला टेस्ट शुरू करें (Next Test)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
