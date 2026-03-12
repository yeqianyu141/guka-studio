import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useLocation, useNavigate } from 'react-router-dom';
import { removeBackground } from '@imgly/background-removal';
import { saveHistory } from '../utils/db';

const MOCK_STICKERS: string[] = [];
// We'll populate this dynamically.

const Photocard = ({ url, canvasWidth, canvasHeight }: { url: string | null, canvasWidth: number, canvasHeight: number }) => {
  const [image] = useImage(url || '');
  
  const cardWidth = canvasWidth * 0.85;
  const cardHeight = canvasHeight * 0.85;
  
  const x = canvasWidth / 2 - cardWidth / 2;
  const y = canvasHeight / 2 - cardHeight / 2;

  if (!url || !image) {
    return (
      <React.Fragment>
        <Rect
          x={x}
          y={y}
          width={cardWidth}
          height={cardHeight}
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth={2}
          dash={[10, 5]}
        />
      </React.Fragment>
    );
  }

  const imageRatio = image.width / image.height;
  const cardRatio = cardWidth / cardHeight;
  
  let crop = { x: 0, y: 0, width: image.width, height: image.height };
  
  if (imageRatio > cardRatio) {
    crop.width = image.height * cardRatio;
    crop.x = (image.width - crop.width) / 2;
  } else {
    crop.height = image.width / cardRatio;
    crop.y = (image.height - crop.height) / 2;
  }

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={cardWidth}
      height={cardHeight}
      crop={crop}
      listening={false}
      cornerRadius={8}
    />
  );
};

const Sticker = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [image] = useImage(shapeProps.url);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        width={80}
        height={80}
        offsetX={40}
        offsetY={40}
        onDragEnd={(e: any) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node: any = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: Math.max(0.05, shapeProps.scaleX * Math.abs(scaleX)),
            scaleY: Math.max(0.05, shapeProps.scaleY * Math.abs(scaleY)),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const stageRef = useRef<any>(null);
  
  const [photocardUrl, setPhotocardUrl] = useState<string | null>(location.state?.photocardUrl || null);
  const [stickers, setStickers] = useState<any[]>([]);
  const [selectedId, selectShape] = useState<string | null>(null);
  const [autoDecorated, setAutoDecorated] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [availableStickers, setAvailableStickers] = useState<string[]>([]);
  const [previewStickers, setPreviewStickers] = useState<string[]>([]);
  const [sliderScale, setSliderScale] = useState<number>(1.0);

  useEffect(() => {
    // Read stickers using Vite's import.meta.glob to work perfectly on Vercel
    try {
      const stickerModules = import.meta.glob('/public/stickers/*.{png,jpg,jpeg,gif,webp}', { eager: true });
      const list = Object.values(stickerModules).map((mod: any) => mod.default);
      
      setAvailableStickers(list);
      // Show only 8 random previews for the sticker library
      const randomPreviews = [...list].sort(() => 0.5 - Math.random()).slice(0, 8);
      setPreviewStickers(randomPreviews);
    } catch (err) {
      console.error("Could not load stickers via import.meta.glob", err);
    }
  }, []);

  // Resize listener for responsive canvas inside the polaroid container
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  const handleAutoDecorate = () => {
    if (!photocardUrl) {
      alert("Please upload a photocard first (Click the center area)!");
      return;
    }
    
    const stickersList = availableStickers.length > 0 ? availableStickers : previewStickers; // Fallback
    if (stickersList.length === 0) {
      alert("No stickers loaded yet.");
      return;
    }

    const newStickers = [];
    // Increase quantity for a lush frame effect
    const numStickers = Math.floor(Math.random() * 10) + 25; // 25 to 34 stickers
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const cardWidth = dimensions.width * 0.85;
    const cardHeight = dimensions.height * 0.85;
    
    const insetX = cardWidth * 0.08; // 8% inwards
    const insetY = cardHeight * 0.05; // 5% inwards
    const frameWidth = cardWidth - insetX * 2;
    const frameHeight = cardHeight - insetY * 2;
    
    const perimeter = 2 * frameWidth + 2 * frameHeight;
    const stepDistance = perimeter / numStickers;
    
    const getPosOnPerimeter = (distance: number) => {
      let d = distance % perimeter;
      if (d < 0) d += perimeter; 
      
      if (d <= frameWidth) return { x: centerX - frameWidth/2 + d, y: centerY - frameHeight/2, edge: 'top' };
      d -= frameWidth;
      
      if (d <= frameHeight) return { x: centerX + frameWidth/2, y: centerY - frameHeight/2 + d, edge: 'right' };
      d -= frameHeight;
      
      if (d <= frameWidth) return { x: centerX + frameWidth/2 - d, y: centerY + frameHeight/2, edge: 'bottom' };
      d -= frameWidth;
      
      return { x: centerX - frameWidth/2, y: centerY + frameHeight/2 - d, edge: 'left' };
    };

    // Keep track of positions to loosely cluster but allow total overlaps
    const generatedPositions: {x:number, y:number, r:number}[] = [];

    // Map deterministically around the perimeter with jitter
    for (let i = 0; i < numStickers; i++) {
      const stickerUrl = stickersList[Math.floor(Math.random() * stickersList.length)];
      
      // Randomize position heavily along the edge to create clumps instead of a perfect line
      const baseDistance = (i * stepDistance) + (Math.random() - 0.5) * stepDistance * 1.5;
      
      const pos = getPosOnPerimeter(baseDistance);
      
      // Jitter perpendicular to edge (scatter inwards/outwards to give thickness to the frame)
      const isCorner = 
         (pos.x < centerX - frameWidth/2 + 20 || pos.x > centerX + frameWidth/2 - 20) &&
         (pos.y < centerY - frameHeight/2 + 20 || pos.y > centerY + frameHeight/2 - 20);
         
      // Thicker cluster at the corners
      const jitterAmount = isCorner ? 30 : 15;
      const jitterX = (Math.random() - 0.5) * jitterAmount;
      const jitterY = (Math.random() - 0.5) * jitterAmount;
      
      const x = pos.x + jitterX;
      const y = pos.y + jitterY;
      
      // Create contrast: a few very large anchor stickers, many small filler stickers
      const isAnchor = Math.random() > 0.75;
      const scale = isAnchor ? (Math.random() * 0.3 + 0.6) : (Math.random() * 0.2 + 0.3);
      
      // Physical stickers are mostly pasted UPWARD facing. Very slight tilts (-20 to 20 deg).
      // They are ALMOST NEVER rotated 90 or 180 degrees sideways unless they are tiny generic shapes.
      // E.g. character stickers must be upright.
      const rotation = (Math.random() * 40) - 20;
      
      const stickerRadius = 30 * scale; 
      
      // Gentle collision heuristic to avoid perfect exact stacking, but allow heavy overlapping
      let tooClose = false;
      for (let prev of generatedPositions) {
         const dx = prev.x - x;
         const dy = prev.y - y;
         const distance = Math.sqrt(dx*dx + dy*dy);
         if (distance < (stickerRadius + prev.r) * 0.3) { // 70% overlap allowed!
             tooClose = true;
             break;
         }
      }

      if (tooClose && !isAnchor) continue; // Allow anchors to force their way in

      generatedPositions.push({ x, y, r: stickerRadius });

      newStickers.push({
        id: `sticker-${Date.now()}-${newStickers.length}`,
        url: stickerUrl,
        x,
        y,
        rotation,
        scaleX: scale,
        scaleY: scale,
        baseX: x,
        baseY: y,
        baseScale: scale,
      });
    }
    setStickers(newStickers);
    setSliderScale(1.0);
    selectShape(null);
    setAutoDecorated(true);
  };

  const handleExport = () => {
    if (stageRef.current) {
      selectShape(null);
      setTimeout(async () => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        
        // Auto-save to gallery
        if (photocardUrl || stickers.length > 0) {
          try {
            await saveHistory({
              id: `history-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: Date.now(),
              dataUrl: uri
            });
          } catch (e) {
            console.error('Failed to save history', e);
          }
        }

        navigate('/export', { state: { previewDataUrl: uri, photocardUrl, stickers } });
      }, 100);
    }
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.id === 'bg-rect';
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setStickers(stickers.filter((s) => s.id !== selectedId));
      selectShape(null);
    }
  };

  const handleReplaceSelected = () => {
    if (selectedId) {
      setStickers(stickers.map(sticker => {
        if (sticker.id === selectedId) {
          let newUrl = sticker.url;
          if (availableStickers.length > 1) {
            while (newUrl === sticker.url) {
              newUrl = availableStickers[Math.floor(Math.random() * availableStickers.length)];
            }
          }
          return { ...sticker, url: newUrl };
        }
        return sticker;
      }));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderScale(val);
    
    if (stickers.length > 0) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      setStickers(stickers.map(sticker => {
        const dx = sticker.baseX - centerX;
        const dy = sticker.baseY - centerY;
        return { 
          ...sticker, 
          x: centerX + dx * val, 
          y: centerY + dy * val, 
          scaleX: sticker.baseScale * val, 
          scaleY: sticker.baseScale * val 
        };
      }));
    }
  };

  const handleClear = () => {
    setStickers([]);
    selectShape(null);
    setAutoDecorated(false);
  }

  const handleUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsProcessingBg(true);
        const originalUrl = URL.createObjectURL(file);
        
        removeBackground(originalUrl).then((imageBlob: Blob) => {
          const cutUrl = URL.createObjectURL(imageBlob);
          setPhotocardUrl(cutUrl);
          setIsProcessingBg(false);
        }).catch((err) => {
          console.error("BG removal failed", err);
          setPhotocardUrl(originalUrl); // Fallback to original
          setIsProcessingBg(false);
          alert("AI Background removal failed, loaded original image.");
        });
      }
    };
    fileInput.click();
  };

  return (
    <div className="min-h-screen flex flex-col font-pixel bg-[var(--color-y2k-lavender)] text-[var(--color-y2k-dark)] relative p-2 md:p-6 overflow-hidden">
      {/* Pink Dots Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle,var(--color-y2k-pink)_3px,transparent_4px)] [background-size:24px_24px]"></div>

      {/* Animated Background Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[30%] left-[20%] text-[var(--color-y2k-pink)] text-5xl star-1 select-none drop-shadow-md">★</div>
        <div className="absolute top-[10%] right-[15%] text-[var(--color-y2k-yellow)] text-4xl star-6 select-none drop-shadow-md" style={{ WebkitTextStroke: '1px var(--color-y2k-dark)' }}>☆</div>
        <div className="absolute bottom-[20%] left-[5%] text-white text-3xl star-3 select-none drop-shadow-md">✦</div>
        <div className="absolute bottom-[30%] right-[10%] text-[var(--color-y2k-blue)] text-3xl star-7 select-none drop-shadow-md">✧</div>
        <div className="absolute top-[5%] left-[5%] text-[var(--color-y2k-yellow)] text-2xl star-8 select-none drop-shadow-md">✨</div>
        <div className="absolute top-[80%] left-[25%] text-[var(--color-y2k-pink)] text-4xl star-9 select-none drop-shadow-md">🌸</div>
        <div className="absolute top-[15%] right-[5%] text-white text-3xl star-4 select-none drop-shadow-md">✧</div>
        <div className="absolute bottom-[10%] right-[25%] text-[var(--color-y2k-pink)] text-6xl star-2 select-none drop-shadow-md">★</div>
        <div className="absolute top-[50%] right-[2%] text-[var(--color-y2k-yellow)] text-xl star-10 select-none drop-shadow-md">✨</div>
        <div className="absolute bottom-[5%] left-[15%] text-[var(--color-y2k-dark)] opacity-30 text-2xl star-5 select-none font-bold">☻</div>
      </div>

      {/* Main Paint Window */}
      <div className="max-w-6xl w-full h-[90vh] mx-auto bg-[var(--color-y2k-white)] border-[2px] border-[var(--color-y2k-pink)] shadow-retro z-10 overflow-hidden relative flex flex-col">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[var(--color-y2k-pink)] to-[var(--color-y2k-lavender)] border-b-[2px] border-[var(--color-y2k-pink)] px-2 py-1 flex justify-between items-center select-none text-[var(--color-y2k-dark)] font-sans text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none pb-1">🎨</span>
            <span className="tracking-wide font-pixel">제목 없음 - 페인트</span>
          </div>
          <div className="flex gap-1 pr-1">
            <button className="w-5 h-5 flex items-center justify-center bg-white border border-[var(--color-y2k-dark)] shadow-[1px_1px_0_rgba(0,0,0,0.2)] text-black font-sans leading-none text-xs pb-1">_</button>
            <button className="w-5 h-5 flex items-center justify-center bg-white border border-[var(--color-y2k-dark)] shadow-[1px_1px_0_rgba(0,0,0,0.2)] text-black font-sans leading-none text-xs">□</button>
            <button onClick={() => navigate('/')} className="w-5 h-5 flex items-center justify-center bg-[#ffadad] border border-[var(--color-y2k-dark)] shadow-[1px_1px_0_rgba(0,0,0,0.2)] text-white font-sans leading-none text-xs font-bold pb-[2px] hover:bg-red-400">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex gap-4 px-2 py-1 text-xs font-sans bg-white border-b-2 border-gray-100 cursor-default text-[var(--color-y2k-dark)] select-none">
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">파일(F)</span>
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">편집(E)</span>
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">보기(V)</span>
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">이미지(I)</span>
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">색상(C)</span>
          <span className="hover:bg-[var(--color-y2k-pink)] px-1">도움말(H)</span>
          <div className="ml-auto flex gap-4 text-xs font-pixel font-bold">
            <button onClick={() => navigate('/')} className="hover:text-[var(--color-y2k-pink)] px-1 flex items-center gap-1">🏠 홈</button>
            <button onClick={handleExport} className="text-blue-500 hover:text-blue-700 px-1 flex items-center gap-1">💾 내보내기</button>
          </div>
        </div>

        {/* Layout: Sidebar + Canvas */}
        <div className="flex flex-grow overflow-hidden bg-white">
          
          {/* Left Toolbar */}
          <div className="w-[80px] flex-shrink-0 bg-white p-[6px] flex flex-col items-center z-10 overflow-y-auto border-r-2 border-gray-100">
            {/* Paint Icons Grid */}
            <div className="grid grid-cols-2 gap-[4px] w-full mb-2">
              <button 
                onClick={handleAutoDecorate}
                title={autoDecorated ? '모두 변경' : '자동 꾸미기'}
                className={`aspect-square flex items-center justify-center text-lg border rounded-sm transition-colors ${autoDecorated ? 'border-gray-300 bg-gray-100 shadow-inner' : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'} w-full`}
              >✨</button>
              <button 
                onClick={handleClear}
                title="캔버스 지우기"
                disabled={!photocardUrl && stickers.length === 0}
                className={`aspect-square flex items-center justify-center text-lg border border-gray-100 rounded-sm hover:border-gray-300 bg-white shadow-sm w-full transition-colors ${(!photocardUrl && stickers.length === 0) ? 'opacity-50 grayscale' : ''}`}
              >🗑️</button>
              {['🔍', '🖌️', '🎨', 'A', '🖍️', '✏️', '〰️', '⬜', '⚪', '🔹'].map((icon, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center text-lg border border-gray-100 rounded-sm hover:border-gray-200 bg-white shadow-sm opacity-60 w-full cursor-not-allowed">
                  {icon}
                </div>
              ))}
            </div>

            {/* Scale Slider Block */}
            <div className="w-full mt-auto mb-1 border-2 border-dashed border-[var(--color-y2k-pink)] rounded p-1">
              <span className="text-[9px] font-pixel font-bold block text-center mb-[2px] text-[var(--color-y2k-dark)] leading-tight tracking-tighter">분산 크기</span>
              <div className="text-center font-pixel font-bold text-[10px] bg-[var(--color-y2k-pink)] border border-[var(--color-y2k-dark)] mb-1 leading-none py-[2px] text-[var(--color-y2k-dark)]">{sliderScale.toFixed(1)}x</div>
              <input 
                className="w-full h-2 bg-gray-200 border border-gray-300 appearance-none cursor-pointer outline-none rounded-full" 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={sliderScale}
                onChange={handleSliderChange}
                disabled={stickers.length === 0}
              />
              <style>
                {`
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 10px;
                    width: 10px;
                    background: var(--color-y2k-white);
                    border: 2px solid var(--color-y2k-dark);
                    border-radius: 50%;
                    cursor: pointer;
                  }
                `}
              </style>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-grow p-4 relative overflow-auto flex items-center justify-center bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22><rect%20width=%2210%22%20height=%2210%22%20fill=%22%23eee%22/><rect%20x=%2210%22%20y=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23eee%22/><rect%20x=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23fff%22/><rect%20y=%2210%22%20width=%2210%22%20height=%2210%22%20fill=%22%23fff%22/></svg>')] bg-repeat">
            {/* Context Menu for Selected Sticker inside Canvas */}
            {selectedId && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 border-2 border-[var(--color-y2k-dark)] shadow-retro-sm rounded flex items-center gap-3 z-20 font-bold text-xs text-[var(--color-y2k-dark)] uppercase">
                <span>✨ 선택됨</span>
                <div className="w-px h-3 bg-gray-300"></div>
                <button onClick={handleReplaceSelected} className="text-[var(--color-y2k-pink)] hover:text-pink-600 flex items-center gap-1">
                  🔄 교체
                </button>
                <div className="w-px h-3 bg-gray-300"></div>
                <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                  🗑️ 삭제
                </button>
              </div>
            )}
            
            {/* The visual canvas paper */}
            <div className="w-full max-w-sm bg-white relative polaroid-inner shadow-sm border border-gray-200">
              <div 
                className={`absolute inset-0 m-1 border-2 border-dashed border-gray-300 transition-colors ${autoDecorated ? 'bg-pink-50/20' : ''}`}
                id="drop-zone"
                ref={containerRef}
              >
                {!photocardUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-50 hover:bg-[var(--color-y2k-pink)]/5 transition-colors" onClick={handleUploadClick}>
                    {isProcessingBg ? (
                      <>
                        <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-[var(--color-y2k-dark)] shadow-retro-sm rounded animate-spin mb-2 text-xl">
                          ⏳
                        </div>
                        <p className="font-pixel font-bold text-[10px] text-[var(--color-y2k-dark)] border-2 border-[var(--color-y2k-dark)] bg-white px-2 py-1 shadow-retro-sm">AI 처리 중...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--color-y2k-dark)] border-dashed bg-white text-[var(--color-y2k-dark)] hover:bg-[var(--color-y2k-pink)] hover:border-solid mb-2 transition-all shadow-retro-sm rounded">
                          <span className="text-3xl leading-none font-bold">+</span>
                        </div>
                        <p className="font-pixel font-bold text-[10px] text-[var(--color-y2k-dark)] bg-white px-2 py-1 border-2 border-[var(--color-y2k-dark)] shadow-retro-sm">사진 업로드</p>
                      </>
                    )}
                  </div>
                )}

                {!autoDecorated && photocardUrl && (
                  <div className="absolute inset-0 bg-white/50 z-10 pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white border-2 border-[var(--color-y2k-dark)] p-3 shadow-retro-sm font-pixel font-bold text-xs text-[var(--color-y2k-dark)] text-center pointer-events-auto shadow-[4px_4px_0px_var(--color-y2k-pink)]">
                      🔒 왼쪽 툴바의 <span className="text-[var(--color-y2k-pink)]">자동 꾸미기</span>를 클릭하여<br/>잠금을 해제하세요!
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 overflow-hidden">
                  {dimensions.width > 0 && dimensions.height > 0 && (
                    <Stage width={dimensions.width} height={dimensions.height} onMouseDown={checkDeselect} onTouchStart={checkDeselect} ref={stageRef}>
                      <Layer>
                        <Rect id="bg-rect" x={0} y={0} width={dimensions.width} height={dimensions.height} fill="transparent" />
                        <Photocard url={photocardUrl} canvasWidth={dimensions.width} canvasHeight={dimensions.height} />
                        {stickers.map((sticker, i) => (
                          <Sticker
                            key={sticker.id}
                            shapeProps={sticker}
                            isSelected={sticker.id === selectedId}
                            onSelect={() => selectShape(sticker.id)}
                            onChange={(newAttrs: any) => {
                              const strks = stickers.slice();
                              const centerX = dimensions.width / 2;
                              const centerY = dimensions.height / 2;
                              newAttrs.baseX = centerX + (newAttrs.x - centerX) / sliderScale;
                              newAttrs.baseY = centerY + (newAttrs.y - centerY) / sliderScale;
                              newAttrs.baseScale = newAttrs.scaleX / sliderScale;
                              strks[i] = newAttrs;
                              setStickers(strks);
                            }}
                          />
                        ))}
                      </Layer>
                    </Stage>
                  )}
                </div>
              </div>
              
              {/* Resize handles matching Paint */}
              <div className="absolute right-[-2px] top-1/2 w-[5px] h-[5px] bg-[var(--color-y2k-dark)] translate-y-[0%]"></div>
              <div className="absolute bottom-[-2px] left-1/2 w-[5px] h-[5px] bg-[var(--color-y2k-dark)] translate-x-[0%]"></div>
              <div className="absolute right-[-2px] bottom-[-2px] w-[5px] h-[5px] bg-[var(--color-y2k-dark)]"></div>
            </div>
          </div>
        </div>

        {/* Bottom Color Palette / Sticker Preview */}
        <div className="h-16 flex-shrink-0 bg-white flex items-stretch p-2 gap-2 z-10 w-full overflow-hidden border-t-2 border-gray-100">
          {/* Fake palette tool area */}
          <div className="w-[40px] h-full bg-gray-50 border border-gray-300 flex items-center justify-center flex-shrink-0 rounded-sm">
             <div className="w-8 h-8 border-2 border-[var(--color-y2k-dark)] overflow-hidden bg-white hover:bg-[var(--color-y2k-pink)] transition-colors cursor-pointer flex items-center justify-center shadow-[2px_2px_0px_var(--color-y2k-pink)] group" title="현재 이미지" onClick={handleUploadClick}>
                {photocardUrl ? (
                   <img src={photocardUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                ) : (
                   <span className="text-[var(--color-y2k-dark)] font-bold">+</span>
                )}
             </div>
          </div>

          {/* Sticker palette (acting as colors) */}
          <div className="flex-grow flex flex-col gap-1 overflow-x-auto">
            <div className="flex gap-1">
              {previewStickers.slice(0, 14).map((url, i) => (
                <div key={`t-${i}`} className={`w-5 h-5 border border-gray-300 bg-white flex items-center justify-center rounded-sm ${!autoDecorated ? 'opacity-50 grayscale' : 'hover:scale-125 hover:border-[var(--color-y2k-pink)] hover:z-10 cursor-pointer'} transition-all`}>
                  <img src={url} className="w-4 h-4 object-contain" />
                </div>
              ))}
              {Array(Math.max(0, 14 - previewStickers.length)).fill(0).map((_, i) => (
                <div key={`empty-t-${i}`} className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-sm"></div>
              ))}
            </div>
            <div className="flex gap-1">
               {Array(Math.max(0, 14 - Math.max(0, previewStickers.length - 14))).fill(0).map((_, i) => (
                 <div key={`empty-b-${i}`} className="w-5 h-5 bg-gray-50 border border-gray-200 rounded-sm"></div>
               ))}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-gray-50 border-t border-gray-200 flex text-[10px] font-pixel text-gray-500 select-none">
          <div className="flex-grow border-r border-gray-200 px-3 flex items-center font-bold tracking-wide text-xs">
            {stickers.length > 0 ? `${stickers.length}개의 활성 레이어 불러옴...` : '도움말 항목을 보려면 도움말 메뉴를 클릭하십시오.'}
          </div>
          <div className="w-32 border-r border-gray-200 px-3 flex items-center justify-center shrink-0">
             {selectedId ? '항목 선택됨' : '유휴 상태'}
          </div>
          <div className="w-32 px-3 flex items-center justify-center shrink-0">
             {dimensions.width} x {dimensions.height}
          </div>
        </div>
      </div>
    </div>
  );
}
