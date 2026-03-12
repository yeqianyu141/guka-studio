import React from 'react';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function RetroWindow({ title, children, className = '', onClose }: RetroWindowProps) {
  return (
    <div className={`retro-window ${className}`}>
      <div className="retro-window-titlebar">
        <span>{title}</span>
        <div className="retro-window-controls">
          <button className="retro-window-btn" title="Minimize">_</button>
          <button className="retro-window-btn" title="Close" onClick={onClose}>X</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[var(--color-y2k-white)]">
        {children}
      </div>
    </div>
  );
}
