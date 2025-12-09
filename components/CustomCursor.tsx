
import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [clickRipple, setClickRipple] = useState<{x: number, y: number, id: number} | null>(null);

  // Position refs to avoid re-renders on mouse move
  const pos = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });
  
  // Trail history
  const history = useRef(Array(8).fill({ x: 0, y: 0 }));

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      
      // Update Text directly for performance
      if (textRef.current) {
         textRef.current.innerText = `X:${e.clientX.toString().padStart(4, '0')} Y:${e.clientY.toString().padStart(4, '0')}`;
      }

      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      
      // Cyberpunk Detection Logic
      const isInteractive = 
        target.matches('button, a, input, textarea, select, [role="button"]') ||
        target.closest('button, a, [role="button"]') ||
        target.classList.contains('node') || 
        target.closest('.node');

      const isDragging = 
        target.classList.contains('grabbing') || 
        target.closest('.grabbing') || 
        document.body.classList.contains('grabbing'); // Check body for global drag cursor

      setIsHovering(!!isInteractive);
      setIsGrabbing(!!isDragging);
    };

    const onMouseDown = () => {
      setIsClicking(true);
      setClickRipple({ x: pos.current.x, y: pos.current.y, id: Date.now() });
      setTimeout(() => setClickRipple(null), 500);
    };
    
    const onMouseUp = () => setIsClicking(false);
    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    // IMPORTANT: Use { capture: true } to ensure events are caught before D3/other libs stop propagation
    window.addEventListener('mousemove', onMouseMove, { capture: true });
    window.addEventListener('mousedown', onMouseDown, { capture: true });
    window.addEventListener('mouseup', onMouseUp, { capture: true });
    document.body.addEventListener('mouseenter', onMouseEnter);
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      window.removeEventListener('mousedown', onMouseDown, { capture: true });
      window.removeEventListener('mouseup', onMouseUp, { capture: true });
      document.body.removeEventListener('mouseenter', onMouseEnter);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  // Animation Loop
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    let frameId: number;
    const loop = () => {
      // 1. Smooth Follower
      const ease = isGrabbing ? 0.3 : 0.15;
      followerPos.current.x += (pos.current.x - followerPos.current.x) * ease;
      followerPos.current.y += (pos.current.y - followerPos.current.y) * ease;

      // 2. Update Cursor & Follower DOM
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
      }

      // 3. Update Trail History
      history.current.pop();
      history.current.unshift({ ...pos.current });

      // Render Trail
      history.current.forEach((p, i) => {
        if (trailRef.current[i]) {
            trailRef.current[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        }
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isGrabbing]);

  if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
     return null;
  }

  return (
    <>
      {/* Trail Elements */}
      {Array(8).fill(0).map((_, i) => (
         <div 
           key={i}
           ref={el => { if(el) trailRef.current[i] = el; }}
           className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full transition-opacity duration-75`}
           style={{ 
             width: Math.max(2, 6 - i * 0.5) + 'px',
             height: Math.max(2, 6 - i * 0.5) + 'px',
             backgroundColor: isGrabbing ? '#ef4444' : '#fcee0a',
             opacity: isVisible ? (0.3 - i * 0.04) : 0,
             willChange: 'transform' 
           }}
         />
      ))}

      {/* Click Ripple */}
      {clickRipple && (
        <div 
           key={clickRipple.id}
           className="fixed pointer-events-none z-[9997] border border-red-500 rounded-full animate-ping opacity-75"
           style={{
             left: clickRipple.x,
             top: clickRipple.y,
             width: '40px',
             height: '40px',
             transform: 'translate(-50%, -50%)'
           }}
        />
      )}

      {/* Main Cursor (Center Dot / Cross) */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[10000] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ willChange: 'transform' }}
      >
        <div className={`
          relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
          transition-all duration-200 ease-out
          ${isGrabbing ? 'scale-150' : 'scale-100'}
        `}>
           {/* Inner Dot */}
           <div className={`
             w-1 h-1 rounded-sm
             ${isHovering || isGrabbing ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-yellow-400 shadow-[0_0_5px_yellow]'}
           `}></div>
           
           {/* Crosshair (X-Shape) */}
           <div className={`absolute w-3 h-[1px] bg-red-500 ${isClicking || isGrabbing ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-all`}></div>
           <div className={`absolute h-3 w-[1px] bg-red-500 ${isClicking || isGrabbing ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-all`}></div>
        </div>

        {/* Coordinate Text */}
        <div 
          ref={textRef}
          className={`absolute top-4 left-4 text-[8px] font-mono tracking-widest pointer-events-none whitespace-nowrap
            ${isHovering ? 'text-red-500 drop-shadow-[0_0_2px_red]' : 'text-yellow-500/50'}
          `}
        >
           X:0000 Y:0000
        </div>
      </div>

      {/* Follower (Brackets & HUD) */}
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ willChange: 'transform' }}
      >
        <div className={`
          relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out
          ${isHovering ? 'w-14 h-14 rotate-90' : 'w-6 h-6 rotate-45'}
          ${isGrabbing ? '!w-8 !h-8 !rotate-0 bg-red-500/20 border-red-500' : ''}
          ${isClicking ? 'scale-75' : 'scale-100'}
        `}>
          
          {/* Brackets */}
          <div className={`absolute top-0 left-0 w-2 h-2 border-l border-t ${isHovering || isGrabbing ? 'border-red-500' : 'border-yellow-400'} transition-colors duration-200`} />
          <div className={`absolute top-0 right-0 w-2 h-2 border-r border-t ${isHovering || isGrabbing ? 'border-red-500' : 'border-yellow-400'} transition-colors duration-200`} />
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-l border-b ${isHovering || isGrabbing ? 'border-red-500' : 'border-yellow-400'} transition-colors duration-200`} />
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-r border-b ${isHovering || isGrabbing ? 'border-red-500' : 'border-yellow-400'} transition-colors duration-200`} />

          {/* Scanning Ring (Hover) */}
          <div className={`
             absolute inset-[-8px] border border-dashed rounded-full animate-[spin-slow_4s_linear_infinite] opacity-30
             ${isHovering ? 'border-red-500 scale-100' : 'border-yellow-400 scale-0'}
             transition-all duration-300
          `}></div>

          {/* Crosshair lines (faint) */}
          <div className={`absolute w-[200px] h-[1px] bg-red-500/20 ${isHovering ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pointer-events-none`} />
          <div className={`absolute h-[200px] w-[1px] bg-red-500/20 ${isHovering ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pointer-events-none`} />
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
