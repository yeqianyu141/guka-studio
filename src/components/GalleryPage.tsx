import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RetroWindow } from './RetroWindow';
import { getAllHistory, HistoryItem, deleteHistory } from '../utils/db';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllHistory().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 디자인을 삭제하시겠습니까?')) {
      await deleteHistory(id);
      setHistory(history.filter(h => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-y2k-lavender)] text-[var(--color-y2k-dark)] font-pixel relative overflow-x-hidden">
      {/* Pink Dots Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_3px,transparent_4px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Decorative bg elements */}
      <div className="absolute top-10 right-20 text-[var(--color-y2k-yellow)] text-4xl star-1 select-none drop-shadow-md">★</div>
      <div className="absolute top-[20%] left-[10%] text-[var(--color-y2k-pink)] text-5xl star-6 select-none drop-shadow-md" style={{ WebkitTextStroke: '1px var(--color-y2k-dark)' }}>☆</div>
      <div className="absolute bottom-20 left-10 text-[var(--color-y2k-pink)] text-5xl star-2 select-none drop-shadow-md">🌸</div>
      <div className="absolute top-[15%] left-[30%] text-[var(--color-y2k-blue)] text-3xl star-7 select-none drop-shadow-md">✧</div>
      <div className="absolute top-1/2 left-20 text-white text-3xl star-3 select-none drop-shadow-md">✦</div>
      <div className="absolute bottom-[30%] right-[10%] text-[var(--color-y2k-yellow)] text-2xl star-8 select-none drop-shadow-md">✨</div>
      <div className="absolute top-[60%] right-[5%] text-[var(--color-y2k-pink)] text-4xl star-9 select-none drop-shadow-md">🎀</div>
      <div className="absolute bottom-[10%] right-[25%] text-white text-4xl star-10 select-none drop-shadow-md" style={{ WebkitTextStroke: '2px var(--color-y2k-dark)' }}>☆</div>
      <div className="absolute top-[40%] right-[15%] text-[var(--color-y2k-dark)] opacity-30 text-3xl star-5 select-none font-bold">☻</div>
      <div className="absolute bottom-[40%] left-[5%] text-[var(--color-y2k-yellow)] text-3xl star-4 select-none drop-shadow-md">★</div>

      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center z-50 relative">
        <button 
          onClick={() => navigate('/')}
          className="retro-btn px-4 py-2 flex items-center gap-2 hover:bg-[var(--color-y2k-yellow)] bg-white"
        >
          <span>←</span> 홈으로_돌아가기.exe
        </button>
        <h1 className="text-2xl font-bold tracking-widest text-shadow-sm text-[var(--color-y2k-dark)] [text-shadow:2px_2px_0px_var(--color-y2k-pink)]">
          내 갤러리 📁
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 w-full max-w-7xl mx-auto z-10 relative">
        <RetroWindow title="gallery_viewer.exe">
          <div className="p-4 md:p-8 bg-gray-50 flex flex-col min-h-[70vh]">
            
            {loading ? (
              <div className="flex-grow flex items-center justify-center text-xl animate-pulse">
                로딩 중...
              </div>
            ) : history.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center opacity-60">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold mb-2">아직 저장된 디자인이 없습니다.</h2>
                <p>작업 공간에서 첫 디자인을 만들어 저장해보세요!</p>
                <button 
                  onClick={() => navigate('/workspace')}
                  className="mt-6 px-8 py-2 retro-btn bg-[var(--color-y2k-pink)]"
                >
                  새 디자인 만들기
                </button>
              </div>
            ) : (
              // Waterfall / Masonry Layout
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {history.map((item) => (
                  <div key={item.id} className="break-inside-avoid relative group transform transition-transform hover:-translate-y-1">
                    <div className="bg-white border-2 border-[var(--color-y2k-dark)] shadow-[4px_4px_0_var(--color-y2k-pink)] p-2 rounded-sm cursor-pointer hover:shadow-[6px_6px_0_var(--color-y2k-yellow)] transition-shadow">
                      <div className="relative overflow-hidden w-full bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22><rect%20width=%2210%22%20height=%2210%22%20fill=%22%23eee%22/><rect%20x=%2210%22%20y=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23eee%22/><rect%20x=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23fff%22/><rect%20y=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23fff%22/></svg>')] bg-repeat border border-gray-200">
                        <img 
                          src={item.dataUrl} 
                          alt="Historical Design" 
                          className="w-full h-auto object-contain block drop-shadow-sm"
                        />
                      </div>
                      <div className="mt-2 flex justify-between items-center px-1">
                        <span className="text-[10px] text-gray-500 font-sans">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(item.id, e)}
                          className="text-red-400 hover:text-red-600 font-sans text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          삭제 ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </RetroWindow>
      </main>
    </div>
  );
}
