import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RetroWindow } from './RetroWindow';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-y2k-lavender)] text-[var(--color-y2k-dark)] overflow-hidden relative">
      {/* Pink Dots Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_3px,transparent_4px)] [background-size:24px_24px]"></div>

      {/* Top Navbar */}
      <header className="w-full p-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎀</span>
          <h1 className="font-pixel text-2xl md:text-3xl font-bold tracking-widest text-shadow-sm text-[var(--color-y2k-dark)] [text-shadow:2px_2px_0px_var(--color-y2k-pink)]">
            GUKA.exe
          </h1>
        </div>
        <nav>
          <button 
            onClick={() => navigate('/gallery')}
            className="px-6 py-2 text-xl font-bold bg-white text-[var(--color-y2k-dark)] border-[4px] border-dashed border-[var(--color-y2k-dark)] shadow-[8px_8px_0_rgba(189,178,210,1)] hover:shadow-[4px_4px_0_rgba(189,178,210,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 drop-shadow-sm rounded-md"
          >
            <span className="text-2xl drop-shadow-sm">📁</span> 내 갤러리
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative">
        {/* Floating kawaii decor (Stars) */}
        <div className="absolute top-20 left-10 text-[var(--color-y2k-yellow)] text-4xl star-1 select-none drop-shadow-md">★</div>
        <div className="absolute top-1/4 right-20 text-[var(--color-y2k-pink)] text-5xl star-2 select-none drop-shadow-md">☆</div>
        <div className="absolute top-1/2 left-[5%] text-[var(--color-y2k-blue)] text-3xl star-7 select-none drop-shadow-md">✧</div>
        <div className="absolute bottom-32 left-1/4 text-white text-3xl star-3 select-none drop-shadow-md">✦</div>
        <div className="absolute bottom-[15%] right-[10%] text-[var(--color-y2k-yellow)] text-2xl star-8 select-none drop-shadow-md">★</div>
        <div className="absolute top-[10%] right-[30%] text-white text-4xl star-6 select-none drop-shadow-md" style={{ WebkitTextStroke: '2px var(--color-y2k-dark)' }}>☆</div>
        <div className="absolute bottom-20 right-1/3 text-[var(--color-y2k-pink)] text-4xl star-4 select-none drop-shadow-md">🌸</div>
        <div className="absolute bottom-[40%] left-[15%] text-[var(--color-y2k-yellow)] text-xl star-9 select-none drop-shadow-md">✨</div>
        <div className="absolute top-[60%] right-[5%] text-[var(--color-y2k-pink)] text-3xl star-10 select-none drop-shadow-md">🎀</div>

        {/* Central Window */}
        <div className="relative z-10 w-full max-w-lg transform md:-rotate-1 hover:rotate-0 transition-transform duration-300">
          <RetroWindow title="System Prompt">
            <div className="p-8 md:p-12 text-center bg-[var(--color-y2k-white)] flex flex-col items-center">
              
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-[var(--color-y2k-lavender)] border-2 border-dashed border-[var(--color-y2k-dark)] rounded-lg flex items-center justify-center text-5xl shadow-[4px_4px_0_var(--color-y2k-pink)]">
                  💿
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-pixel font-bold mb-4 leading-relaxed tracking-wide">
                <span className="text-[var(--color-y2k-pink)]">⚠️</span> 엄청 귀여운 꾸미기 혜택을<br/>
                받으시겠습니까?
              </h2>
              
              <button 
                onClick={handleStart}
                className="mt-6 px-12 py-3 retro-btn text-xl font-bold bg-[var(--color-y2k-yellow)] hover:bg-[var(--color-y2k-pink)] transition-colors inline-block"
              >
                시작 🖱️
              </button>
            </div>
          </RetroWindow>

          {/* Decorative small window behind or below */}
          <div className="absolute -bottom-16 -right-8 -z-10 transform rotate-3">
             <div className="retro-window w-48 text-xs">
                <div className="retro-window-titlebar py-1 px-2 text-[10px]">
                  <span>status.txt</span>
                  <div className="retro-window-controls scale-75 origin-right">
                    <button className="retro-window-btn">X</button>
                  </div>
                </div>
                <div className="p-3 bg-white text-center text-gray-500 font-pixel">
                   사용자 대기 중...
                </div>
             </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="absolute bottom-6 bg-[var(--color-y2k-white)] text-[var(--color-y2k-dark)] px-4 py-1 border-2 border-[var(--color-y2k-dark)] font-pixel shadow-retro-sm text-sm">
          ▶▶▶ 트렌딩: #다꾸 #Y2K #픽셀
        </div>
      </main>
    </div>
  );
}
