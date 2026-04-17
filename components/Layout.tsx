
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
  onTopicTestsClick: () => void;
  onExamPapersClick: () => void;
  onBookmarksClick: () => void;
  onProfileClick: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  profilePic?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onHomeClick, 
  onTopicTestsClick, 
  onExamPapersClick,
  onBookmarksClick,
  onProfileClick, 
  onLogout, 
  isLoggedIn,
  userName,
  profilePic
}) => {
  return (
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans']">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 h-20 flex items-center">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={onHomeClick}
            className="flex items-center space-x-3 group"
          >
            <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-slate-900 uppercase">RAJ<span className="text-blue-600">QUIZER</span></span>
          </button>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={onHomeClick} className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Home</button>
            {isLoggedIn && (
              <>
                <button onClick={onTopicTestsClick} className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Topic Tests</button>
                <button onClick={onExamPapersClick} className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Exam Papers</button>
                <button onClick={onBookmarksClick} className="text-slate-600 hover:text-rose-600 font-bold transition-colors flex items-center gap-1">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   Saved
                </button>
                <button onClick={onProfileClick} className="group flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner overflow-hidden border border-white">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-slate-600 group-hover:text-blue-600 font-bold text-sm">{userName || 'Profile'}</span>
                </button>
              </>
            )}
            {isLoggedIn && (
              <button 
                onClick={onLogout}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-rose-50 hover:text-rose-600 transition-all text-sm flex items-center gap-2"
              >
                Logout
              </button>
            )}
          </nav>

          <div className="lg:hidden flex items-center gap-4">
            {isLoggedIn && (
               <button onClick={onProfileClick} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-sm active:scale-90 transition-transform overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  )}
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6 text-center">
            <div className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter text-blue-600">RAJQUIZER</div>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Authentic preparation platform using official RSSB & RPSC question banks.
            </p>
            <div className="flex flex-col items-center gap-4">
              <a 
                href="https://www.instagram.com/banwaripratihar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-rose-100 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Made by @banwaripratihar
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              © 2024-2026 RAJQUIZER PORTAL.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
