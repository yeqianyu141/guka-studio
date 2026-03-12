import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { RetroWindow } from './RetroWindow';

const ExportSticker = ({ url, x, y, size }: { url: string, x: number, y: number, size: number }) => {
  const [img] = useImage(url);
  return <KonvaImage image={img} x={x} y={y} width={size} height={size} />;
};

/* 
  Location state will receive:
  - photocardUrl (string)
  - stickers (array)
  - previewDataUrl (string) for digital result
*/

export default function ExportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { previewDataUrl, photocardUrl, stickers } = location.state || {};
  const printStageRef = React.useRef<any>(null);

  const handleDownloadSheet = async () => {
    if (!printStageRef.current) return;
    
    try {
      // Export natively from canvas using pixelRatio to achieve ~300DPI equivalent
      const uri = printStageRef.current.toDataURL({ 
        pixelRatio: 4, 
        mimeType: 'image/jpeg', 
        quality: 1.0 
      });
      
      const link = document.createElement('a');
      link.download = 'guka-a5-physical-sheet.jpg';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err: any) {
      console.error("JPG generation failed:", err);
      alert(`Export Failed! Error details: ${err?.message || JSON.stringify(err) || String(err)}`);
    }
  };

  const handleDownloadPreview = () => {
    if (previewDataUrl) {
      const link = document.createElement('a');
      link.download = 'guka-digital-result.png';
      link.href = previewDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Math calculated optimal A5 Packing Grid
  const STAGE_W = 320;
  const STAGE_H = 453;
  const PADDING = 20;
  const usableW = STAGE_W - PADDING * 2;
  const usableH = STAGE_H - PADDING * 2;
  const N = stickers?.length || 0;
  
  let layout = { cols: 1, rows: 1, size: 0 };
  if (N > 0) {
    for (let c = 1; c <= N; c++) {
      const r = Math.ceil(N / c);
      const size = Math.min(usableW / c, usableH / r);
      if (size > layout.size) {
        layout = { cols: c, rows: r, size };
      }
    }
  }
  
  // 30% empty space for die-cut scissor room
  const stickerSize = layout.size * 0.7; 

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[var(--color-y2k-lavender)] font-pixel text-[var(--color-y2k-dark)] relative overflow-hidden">
      {/* Pink-Gray Dots Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_3px,transparent_4px)] [background-size:24px_24px]"></div>

      {/* Decorative bg elements */}
      <div className="absolute top-10 left-10 text-[var(--color-y2k-yellow)] text-4xl star-1 select-none drop-shadow-md">★</div>
      <div className="absolute top-[15%] right-[20%] text-[var(--color-y2k-pink)] text-5xl star-6 select-none drop-shadow-md" style={{ WebkitTextStroke: '1px var(--color-y2k-dark)' }}>☆</div>
      <div className="absolute top-[40%] left-[8%] text-white text-3xl star-7 select-none drop-shadow-md">✧</div>
      <div className="absolute bottom-20 right-10 text-[var(--color-y2k-pink)] text-5xl star-2 select-none drop-shadow-md">🌸</div>
      <div className="absolute bottom-[30%] left-[15%] text-[var(--color-y2k-blue)] text-3xl star-8 select-none drop-shadow-md">✦</div>
      <div className="absolute top-1/3 right-1/4 text-white text-3xl star-3 select-none drop-shadow-md">✦</div>
      <div className="absolute bottom-[10%] left-[30%] text-[var(--color-y2k-yellow)] text-2xl star-9 select-none drop-shadow-md">✨</div>
      <div className="absolute top-[60%] right-[8%] text-[var(--color-y2k-pink)] text-4xl star-10 select-none drop-shadow-md">🎀</div>
      <div className="absolute top-[80%] left-[10%] text-white text-4xl star-4 select-none drop-shadow-md" style={{ WebkitTextStroke: '2px var(--color-y2k-dark)' }}>☆</div>
      <div className="absolute bottom-[5%] right-[40%] text-[var(--color-y2k-dark)] opacity-30 text-3xl star-5 select-none font-bold">☻</div>

      {/* Back button */}
      <div className="w-full max-w-6xl flex mb-6 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="retro-btn px-4 py-2 flex items-center gap-2 hover:bg-[var(--color-y2k-yellow)] bg-white"
        >
          <span>←</span> 홈으로_돌아가기.exe
        </button>
      </div>

      <main className="w-full max-w-6xl flex flex-col gap-8 relative z-10">
        <section className="flex flex-col md:flex-row justify-center gap-8 items-center md:items-start md:px-12">
          
          {/* Physical Sheet Preview */}
          <div className="flex flex-col items-center flex-1 max-w-[400px] w-full transform -rotate-1 hover:rotate-0 transition-transform">
            <RetroWindow title="실물_인쇄_미리보기.jpg">
              <div className="p-4 bg-[var(--color-y2k-lavender)] flex flex-col items-center">
                <div className="w-[320px] h-[453px] bg-white border-2 border-[var(--color-y2k-dark)] shadow-[4px_4px_0_var(--color-y2k-pink)] relative overflow-hidden">
                  <Stage width={STAGE_W} height={STAGE_H} ref={printStageRef}>
                    <Layer>
                      <Rect width={STAGE_W} height={STAGE_H} fill="#ffffff" />
                      
                      {stickers?.map((s: any, i: number) => {
                        const col = i % layout.cols;
                        const row = Math.floor(i / layout.cols);
                        
                        const gridW = layout.cols * layout.size;
                        const gridH = layout.rows * layout.size;
                        const startX = (STAGE_W - gridW) / 2;
                        const startY = (STAGE_H - gridH) / 2;
                        
                        const cellX = startX + col * layout.size + layout.size / 2;
                        const cellY = startY + row * layout.size + layout.size / 2;
                        
                        return (
                          <ExportSticker 
                            key={i} 
                            url={s.url} 
                            x={cellX - stickerSize / 2} 
                            y={cellY - stickerSize / 2} 
                            size={stickerSize} 
                          />
                        );
                      })}
                    </Layer>
                  </Stage>
                  
                  {N === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-y2k-dark)] p-4 text-center font-bold bg-white/80">
                      ⚠️ 사용된 스티커가 없습니다. <br/> 돌아가서 추가해주세요!
                    </div>
                  )}
                </div>
              </div>
            </RetroWindow>
          </div>

          {/* Digital Result */}
          <div className="flex flex-col items-center flex-1 max-w-[400px] w-full transform rotate-1 hover:rotate-0 transition-transform">
            <RetroWindow title="디지털_완성본.png">
              <div className="p-4 bg-[var(--color-y2k-blue)]/50 flex flex-col items-center">
                <div className="relative group w-[320px] h-[453px]">
                  <div className="w-full h-full bg-white border-2 border-[var(--color-y2k-dark)] shadow-[4px_4px_0_var(--color-y2k-dark)] flex items-center justify-center p-2 relative z-10 transition-transform group-hover:-translate-y-1">
                    <div className="w-full h-full bg-[var(--color-y2k-lavender)] border border-dashed border-[var(--color-y2k-dark)] overflow-hidden relative flex items-center justify-center">
                      {previewDataUrl ? (
                        <img alt="Digital Result" className="w-full h-full object-contain" src={previewDataUrl} />
                      ) : (
                        <span className="text-[var(--color-y2k-dark)] font-bold">이미지를 찾을 수 없습니다</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </RetroWindow>
          </div>

        </section>

        {/* Action Bar (Save Dialog) */}
        <div className="w-full max-w-2xl mx-auto mt-8">
           <RetroWindow title="다른 이름으로 저장...">
             <div className="p-6 bg-[var(--color-y2k-white)] flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-4xl pr-4 border-r-2 border-dashed border-[var(--color-y2k-dark)] mr-2">
                  💾
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleDownloadSheet}
                    className="retro-btn bg-[var(--color-y2k-yellow)] px-6 py-3 w-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors"
                  >
                    <span>🖨️</span> A5 스티커 용지 인쇄 (JPG)
                  </button>
                  <button 
                    onClick={handleDownloadPreview}
                    disabled={!previewDataUrl}
                    className="retro-btn bg-[var(--color-y2k-pink)] px-6 py-3 w-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-pink-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🖼️</span> 디지털 카드 다운로드 (PNG)
                  </button>
                </div>
             </div>
           </RetroWindow>
        </div>
      </main>
    </div>
  );
}
