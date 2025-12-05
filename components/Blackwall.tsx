import React, { useEffect, useRef, useState } from 'react';
import { ShieldBan, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

const ERROR_PHRASES = [
  "FATAL_EXCEPTION", "NO_ESCAPE", "WATCHING_YOU", 
  "SIGNAL_LOST", "CORRUPTION_DETECTED", "SYSTEM_FAILURE", 
  "RUN_DAEMON", "INTERLOPERS", "0xDEADBEEF", "ERROR_CODE_666",
  "DON'T LOOK", "CONNECTION_RESET", "MEMORY_LEAK", "BUFFER_OVERFLOW",
  "CRITICAL_STOP", "KERNEL_PANIC", "SEGMENTATION_FAULT", "NULL_POINTER",
  "BREACH_DETECTED", "PROTOCOL_MISMATCH", "DATA_ROT", "KILL_PROCESS",
  "RELIC_MALFUNCTION", "MIKOSHI_UNREACHABLE", "ALT_CUNNINGHAM_DETECTED",
  "NETWATCH_PURGE_ACTIVE", "CYBERPSYCHOSIS_INIT", "SOULKILLER_V.2.0",
  "ARASAKA_TOWER_FALLS", "ENGRAM_INTEGRITY_0%", "NEURAL_LINK_SEVERED",
  "ICE_BREAKER_FAILED", "DAEMON_UPLOAD_COMPLETE", "BLACKWALL_PENETRATION",
  "V_VITAL_SIGNS_CRITICAL", "JOHNNY_IS_HERE", "BURN_CORPO_SHIT",
  "SECURE_YOUR_SOUL_FAIL", "SYS_HACK_DETECTED", "OVERHEAT_WARNING",
  "SYNAPSE_BURNOUT", "BRAINDANCE_LOOP_ERROR", "NO_FUTURE", "WAKE_THE_FUCK_UP"
];

const Blackwall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Store active glitch messages
  const messagesRef = useRef<Array<{
    x: number;
    y: number;
    text: string;
    originalText: string;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    scale: number;
    scaleSpeed: number;
  }>>([]);

  // Initialize Image Loader
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = '/1.png'; // Root path

    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      console.warn("Failed to load Johnny's face image (/1.png). Using procedural fallback.");
      setError(true);
      setImgLoaded(true); // Proceed to load canvas anyway using fallback
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
  };

  const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
  };

  useEffect(() => {
    if (!imgLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let frameCount = 0;

    const render = () => {
      // Safety check: Canvas dimensions must be positive
      if (canvas.width === 0 || canvas.height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      frameCount++;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Background Trails (The "Lag")
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(20, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Heavy Block Artifacts (Data Corruption)
      // Interact with mouse: Blocks avoid the mouse slightly
      const blockCount = Math.floor(Math.random() * 12);
      for (let i = 0; i < blockCount; i++) {
        const w = Math.random() * canvas.width * 0.5;
        const h = Math.random() * 150;
        let x = Math.random() * canvas.width - (w/2);
        let y = Math.random() * canvas.height;

        // Simple repulsion
        const dx = x + w/2 - mx;
        const dy = y + h/2 - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
             x += dx * 0.2;
             y += dy * 0.2;
        }

        ctx.fillStyle = Math.random() > 0.6 ? '#ef4444' : '#000000'; 
        ctx.globalAlpha = Math.random() * 0.6;
        
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1.0;
      }

      // 3. Matrix/Code Rain (Red)
      ctx.fillStyle = '#ff0000';
      const rainDrops = 8;
      for(let i=0; i<rainDrops; i++) {
        if (Math.random() > 0.5) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            const fontSize = Math.random() * 24 + 12;
            
            // Mouse interaction: brighter near mouse
            const dist = Math.sqrt(Math.pow(x-mx, 2) + Math.pow(y-my, 2));
            
            ctx.font = `${fontSize}px monospace`;
            ctx.globalAlpha = dist < 150 ? 1.0 : Math.random();
            ctx.shadowBlur = dist < 150 ? 10 : 0;
            ctx.shadowColor = '#ff0000';
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
      }

      // 4. Render Face (Image or Fallback)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Mouse Interaction: Face Parallax & Jitter Increase
      const mouseDist = Math.sqrt(Math.pow(centerX - mx, 2) + Math.pow(centerY - my, 2));
      const proximityFactor = Math.max(0, 1 - mouseDist / 500); // 0 to 1 based on nearness

      // Parallax
      const targetX = (mx - centerX) * 0.05;
      const targetY = (my - centerY) * 0.05;

      const isLagSpike = Math.random() > 0.9;
      // Jitter increases if mouse is far (instability) or very close (interference)
      const baseJitter = isLagSpike ? 50 : 5;
      const jitterX = (Math.random() - 0.5) * (baseJitter + proximityFactor * 20);
      const jitterY = (Math.random() - 0.5) * (baseJitter + proximityFactor * 20);

      ctx.save();
      
      if (imageRef.current && !error) {
         const img = imageRef.current;
         const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 1.1; 
         const w = img.width * scale;
         const h = img.height * scale;
         const x = centerX - w / 2 + jitterX + targetX;
         const y = centerY - h / 2 + jitterY + targetY;

         const isGlitchFrame = Math.random() > 0.7 || proximityFactor > 0.8;

         // --- RGB SPLIT (Chromatic Aberration) ---
         // Increases with mouse proximity
         const splitIntensity = 10 + (proximityFactor * 30);

         ctx.globalCompositeOperation = 'screen';
         ctx.globalAlpha = 0.7;
         if (isGlitchFrame) {
            const shift = (Math.random() * splitIntensity) + 10;
            ctx.drawImage(img, x - shift, y - 5, w, h);
         }
         
         ctx.globalAlpha = 0.7;
         if (isGlitchFrame) {
            const shift = (Math.random() * splitIntensity) + 10;
            ctx.drawImage(img, x + shift, y + 5, w, h);
         }

         // 3. Main Image
         ctx.globalCompositeOperation = 'source-over';
         ctx.globalAlpha = 0.85; 
         
         if (Math.random() > 0.96) {
             ctx.filter = 'invert(1) contrast(200%)';
         } else {
             // Brighter filter
             ctx.filter = 'contrast(130%) brightness(130%) sepia(100%) hue-rotate(-50deg) saturate(300%)'; 
         }
         
         const stretchY = isGlitchFrame ? h * (0.9 + Math.random() * 0.2) : h;
         ctx.drawImage(img, x, y - (stretchY-h)/2, w, stretchY);
         
         ctx.filter = 'none';

         // 4. Overlay
         ctx.globalCompositeOperation = 'multiply';
         ctx.fillStyle = '#ff0000';
         ctx.globalAlpha = 0.4;
         ctx.fillRect(x, y - (stretchY-h)/2, w, stretchY);

      } else {
         // Fallback
         ctx.translate(centerX + jitterX + targetX, centerY + jitterY + targetY);
         ctx.beginPath();
         ctx.ellipse(0, 0, 100, 140, 0, 0, Math.PI * 2);
         ctx.fillStyle = '#100';
         ctx.fill();
         ctx.beginPath();
         ctx.lineWidth = 3;
         for(let i=0; i<30; i++) {
            ctx.moveTo((Math.random()-0.5)*150, (Math.random()-0.5)*180);
            ctx.lineTo((Math.random()-0.5)*150, (Math.random()-0.5)*180);
         }
         ctx.strokeStyle = '#f00';
         ctx.stroke();
      }
      
      ctx.restore();

      // 5. Scanline Displacement (Tearing)
      // Tear mostly at mouse Y if mouse is inside
      ctx.globalCompositeOperation = 'source-over';
      
      if (Math.random() > 0.4) {
        const slices = Math.floor(Math.random() * 10) + 2;
        
        for (let i = 0; i < slices; i++) {
          const sliceHeight = Math.max(2, Math.floor(Math.random() * 50));
          let sliceY = Math.floor(Math.random() * canvas.height);

          // If mouse is active, prioritize tearing near mouse Y
          if (my > 0 && Math.random() > 0.5) {
             sliceY = my + (Math.random() - 0.5) * 200;
          }
          
          if (sliceY + sliceHeight <= canvas.height && sliceY >= 0) {
            try {
              const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceHeight);
              const offsetX = (Math.random() - 0.5) * (proximityFactor > 0.5 ? 200 : 50); 
              ctx.putImageData(imageData, offsetX, sliceY);
            } catch (e) { /* ignore */ }
          }
        }
      }

      // 6. Dynamic Error Messages
      ctx.globalCompositeOperation = 'source-over';
      
      // Spawn new messages randomly
      if (Math.random() > 0.90) { // Increased spawn rate slightly (was 0.94)
        const originalText = ERROR_PHRASES[Math.floor(Math.random() * ERROR_PHRASES.length)];
        messagesRef.current.push({
           x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
           y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1,
           text: originalText,
           originalText: originalText,
           life: 30 + Math.random() * 90,
           maxLife: 120,
           size: 14 + Math.random() * 24,
           color: Math.random() > 0.7 ? '#ffffff' : '#ef4444', // Mostly White, some Red
           vx: (Math.random() - 0.5) * 4, // Faster
           vy: (Math.random() - 0.5) * 4, // Faster
           scale: 1,
           scaleSpeed: 0.01 + Math.random() * 0.05
        });
      }

      // Update and Draw Messages
      for (let i = messagesRef.current.length - 1; i >= 0; i--) {
         const msg = messagesRef.current[i];
         msg.life--;
         msg.x += msg.vx;
         msg.y += msg.vy;
         msg.scale += Math.sin(frameCount * 0.2) * 0.01; // Throbbing effect

         if (msg.life <= 0) {
             messagesRef.current.splice(i, 1);
             continue;
         }

         // Aggressive Glitch Logic
         if (Math.random() > 0.7) {
             // Swap characters
             const charIndex = Math.floor(Math.random() * msg.text.length);
             const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?010101XY";
             const char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
             msg.text = msg.text.substring(0, charIndex) + char + msg.text.substring(charIndex + 1);
         } else if (Math.random() > 0.85) {
             // Reset to original
             msg.text = msg.originalText;
         }

         const opacity = Math.min(1, msg.life / 20);
         ctx.globalAlpha = opacity;
         ctx.font = `bold ${msg.size}px "Share Tech Mono", monospace`;
         
         // Jitter draw position
         const jx = (Math.random() - 0.5) * 6; // More jitter
         const jy = (Math.random() - 0.5) * 6;

         ctx.save();
         ctx.translate(msg.x + jx, msg.y + jy);
         // Removed Rotation
         ctx.scale(msg.scale, msg.scale);

         const textMetrics = ctx.measureText(msg.text);
         const textHeight = msg.size; 
         
         // Randomly invert colors for intense flash
         const isInverted = Math.random() > 0.95;
         
         // Background box
         ctx.fillStyle = isInverted ? msg.color : 'rgba(0,0,0,0.85)';
         ctx.fillRect(-4, -textHeight + 4, textMetrics.width + 8, textHeight + 8);

         // RGB Split effect on text
         if (Math.random() > 0.6) {
             ctx.fillStyle = 'cyan';
             ctx.fillText(msg.text, -3, 0);
             ctx.fillStyle = 'red';
             ctx.fillText(msg.text, 3, 0);
         }
         
         ctx.fillStyle = isInverted ? '#000000' : msg.color;
         ctx.fillText(msg.text, 0, 0);
         
         // Random Strikethrough or Block
         if (Math.random() > 0.85) {
              ctx.fillStyle = isInverted ? '#000000' : msg.color;
              ctx.fillRect(0, -msg.size/2 + 2, textMetrics.width, Math.random() * 4 + 1);
         }

         ctx.restore();
      }
      ctx.globalAlpha = 1.0;


      // 7. Mouse Interaction Circle (Targeting System)
      if (mx > -100 && my > -100) {
         ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.arc(mx, my, 20, 0, Math.PI * 2);
         ctx.stroke();
         
         ctx.beginPath();
         ctx.moveTo(mx - 30, my);
         ctx.lineTo(mx + 30, my);
         ctx.moveTo(mx, my - 30);
         ctx.lineTo(mx, my + 30);
         ctx.stroke();

         // Add some noise near mouse
         const noiseW = 100;
         const noiseH = 100;
         try {
            const noiseImg = ctx.getImageData(mx - noiseW/2, my - noiseH/2, noiseW, noiseH);
            for(let j=0; j<noiseImg.data.length; j+=4) {
                if (Math.random() > 0.8) {
                   noiseImg.data[j] = 255; // R
                   noiseImg.data[j+1] = 0; // G
                   noiseImg.data[j+2] = 0; // B
                }
            }
            ctx.putImageData(noiseImg, mx - noiseW/2, my - noiseH/2);
         } catch(e){}
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imgLoaded, error]);

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full relative bg-black overflow-hidden select-none clip-corner cursor-crosshair"
    >
      
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* Overlay UI */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 md:p-8 flex flex-col justify-between z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-red-500 pb-4 bg-black/40 backdrop-blur-[1px]">
           <div className="flex flex-col relative overflow-hidden group">
             {/* Dynamic Title */}
             <div className="relative mb-2">
                {/* 1. Blur Glow Background */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-red-600 absolute inset-0 blur-md animate-pulse opacity-80 scale-y-125 origin-top">
                  BLACKWALL
                </h1>
                {/* 2. Main Title Gradient */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-red-600 via-red-500 to-white relative z-10 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)] scale-y-125 origin-top">
                  BLACKWALL
                </h1>
                {/* 3. Glitch Overlay Top */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white absolute top-0 left-0 z-20 mix-blend-overlay opacity-30 animate-bounce scale-y-125 origin-top hidden group-hover:block">
                  BLACKWALL
                </h1>
             </div>

             <div className="inline-block bg-red-600 text-black px-2 py-1 transform -skew-x-12 mt-4 self-start shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse">
                <span className="text-sm md:text-lg font-bold uppercase tracking-[0.5em] block transform skew-x-12">
                  FATAL SYSTEM ERROR
                </span>
             </div>
           </div>
           
           <ShieldBan size={64} className="text-red-500 animate-pulse drop-shadow-[0_0_35px_rgba(255,0,0,1)] md:w-24 md:h-24" />
        </div>

        {/* Loading State / Error State Messages */}
        {!imgLoaded && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
             <RefreshCw size={64} className="text-red-500 animate-spin mb-6 mx-auto drop-shadow-[0_0_10px_red]" />
             <div className="text-red-400 font-mono animate-pulse text-2xl font-bold tracking-widest drop-shadow-md">BREACHING FIREWALL...</div>
           </div>
        )}

        {/* Footer Data */}
        <div className="flex flex-col md:flex-row justify-between items-end text-red-400 font-mono text-xs bg-black/60 p-4 border-t-2 border-red-500 gap-2 backdrop-blur-sm">
           <div className="flex flex-col gap-1 md:gap-2">
              <span className="animate-pulse text-sm md:text-lg font-bold text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">PING: ERROR</span>
              <span className="text-red-300 font-bold">PACKET LOSS: 100%</span>
              <span className="text-red-500 font-black text-lg md:text-xl drop-shadow-[0_0_8px_red]">THREAT LEVEL: EXTREME</span>
           </div>
           <div className="text-right">
              <div className="animate-bounce font-black text-red-500 text-lg md:text-2xl drop-shadow-[0_0_15px_red]">SYSTEM COMPROMISED</div>
              <div className="text-red-300 font-bold tracking-widest">SECTOR: [REDACTED]</div>
           </div>
        </div>
      </div>

      {/* CRT Scanline Overlay - Intense Red */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(50,0,0,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,0,0,0.02),rgba(50,0,0,0.06))] z-20 bg-[length:100%_4px,4px_100%] opacity-70 mix-blend-overlay"></div>
      
      {/* Heavy Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] z-30"></div>
    </div>
  );
};

export default Blackwall;