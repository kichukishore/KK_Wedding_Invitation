"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Heart, Users, Download, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { toPng } from "html-to-image";

/* ─────────────────────────────────────────
   COUNTDOWN HOOK
───────────────────────────────────────── */
function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.max(0, diff);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const mins = Math.floor((total % 3600000) / 60000);
  const secs = Math.floor((total % 60000) / 1000);
  return { days, hours, mins, secs };
}

/* ─────────────────────────────────────────
   INDIVIDUAL SCRATCH BLOCK
───────────────────────────────────────── */
function ScratchBlock({ 
  label, 
  value, 
  onRevealed 
}: { 
  label: string, 
  value: string, 
  onRevealed: () => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const drawing = useRef(false);
  const notified = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Rich scratch surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#c4873a");
    gradient.addColorStop(0.5, "#f8d77a");
    gradient.addColorStop(1, "#9c6020");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle texture overlay
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
  }, []);

  const scratch = useCallback(
    (x: number, y: number) => {
      if (revealed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (x - rect.left) * scaleX;
      const cy = (y - rect.top) * scaleY;
      
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      // measure revealed %
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] < 128) cleared++;
      const pct = Math.round((cleared / (canvas.width * canvas.height)) * 100);
      
      if (pct > 60 && !notified.current) {
        notified.current = true;
        setRevealed(true);
        onRevealed();
      }
    },
    [onRevealed, revealed]
  );

  const handleDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    scratch(clientX, clientY);
  };

  return (
    <div className="relative select-none flex flex-col items-center w-[90px] md:w-[110px]">
      <p className="text-amber-300 font-[Georgia] text-[10px] tracking-[0.2em] uppercase mb-2 h-4">{label}</p>
      <div className="relative w-full h-[80px] rounded-xl overflow-hidden border border-rose-300/20 shadow-lg">
        {/* Hidden Content */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950">
          <p className="text-white font-[Georgia] text-2xl md:text-3xl font-bold">{value}</p>
        </div>
        {/* Scratch Canvas */}
        <canvas
          ref={canvasRef}
          width={110}
          height={80}
          className="relative z-10 w-full h-full cursor-crosshair"
          style={{ touchAction: "none", opacity: revealed ? 0 : 1, transition: "opacity 0.6s ease" }}
          onMouseDown={(e) => { drawing.current = true; handleDraw(e); }}
          onMouseMove={handleDraw}
          onMouseUp={() => drawing.current = false}
          onMouseLeave={() => drawing.current = false}
          onTouchStart={(e) => { drawing.current = true; handleDraw(e); }}
          onTouchMove={handleDraw}
          onTouchEnd={() => drawing.current = false}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PARTY PAPERS (CONFETTI)
───────────────────────────────────────── */
function ConfettiBurst() {
  const colors = ["🎉","#ffd89b", "#c4873a", "#e07840", "#ffffff","🎊", "#f8d77a", "#f3d5b0", "#d99b5d", "🕊️"];
  const particles = Array.from({ length: 90 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 2.5 + Math.random() * 2,
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 10,
    shape: Math.random() > 0.55 ? "paper" : Math.random() > 0.5 ? "rect" : "circle",
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden no-print">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "110vh", x: `${p.x}vw`, opacity: 1, rotate: p.rotation }}
          animate={{
            y: "-10vh",
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
            opacity: [1, 1, 0],
            rotate: p.rotation + 360,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            width: p.shape === "paper" ? p.size * 2.5 : p.size,
            height: p.shape === "paper" ? p.size * 1.1 : p.shape === "rect" ? p.size * 2 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "paper" ? "18%" : "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        />
      ))}
    </div>    
  );
}

/* ─────────────────────────────────────────
   AESTHETIC BACKGROUND (Stars & Glow) - LIGHT MODE
───────────────────────────────────────── */
function AestheticBackground() {
  // Deterministic pseudo-random based on index to avoid hydration mismatch
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const stars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 1.3) * 100,
    y: seededRandom(i * 2.7) * 100,
    size: 8 + seededRandom(i * 3.9) * 12,
    dur: 3 + seededRandom(i * 4.1) * 4,
    delay: seededRandom(i * 5.3) * 2,
    symbol: seededRandom(i * 6.7) > 0.5 ? "✦" : "✧"
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#faf8f5] via-[#f5f0e8] to-[#ede5dd] no-print">
      {/* Soft gradient orbs - light peachy tones */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-200/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-200/15 blur-[120px]" />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-orange-200/10 blur-[80px]" />
      
      {stars.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${s.x}vw`, top: `${s.y}vh`, fontSize: s.size, color: "rgba(196, 135, 58, 0.2)" }}
        >
          {s.symbol}
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   BACKGROUND IMAGE GALLERY - UNIQUE 3 IMAGE CAROUSEL
───────────────────────────────────────── */
function BackgroundImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    { src: "/KK_Wedding_Invitation/ring.png", title: "The Beginning", date: "Our Story" },
    { src: "/KK_Wedding_Invitation/kichu2.png", title: "Growing Together", date: "Moments Shared" },
    { src: "/KK_Wedding_Invitation/Image3.png", title: "Pure Love", date: "Forever" },
  ];

  const handleImageClick = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      onClick={handleImageClick}
      className="relative w-full max-w-2xl mx-auto h-[500px] rounded-3xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0 }}
    >
      {/* Background Images Container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex].src}
            alt={images[currentIndex].title}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full object-cover grayscale-[30%] sepia-[15%]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.parentElement as HTMLElement).style.background = "linear-gradient(135deg, #e8d5c4, #d9c5b3)";
            }}
          />
        </AnimatePresence>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0e8]/90 via-[#f5f0e8]/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#8b4513] text-sm tracking-[0.3em] uppercase mb-4 font-[Georgia]">
            {images[currentIndex].date}
          </p>
          <h2 className="text-[clamp(32px,6vw,52px)] font-light italic text-[#5c3d2e] mb-6 font-[Georgia]">
            {images[currentIndex].title}
          </h2>
          <p className="text-[#7a5a4a] text-base opacity-80">❤️</p>
        </motion.div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`rounded-full transition-all backdrop-blur-sm ${
              idx === currentIndex
                ? "bg-[#8b4513] w-10 h-3"
                : "bg-white/40 w-3 h-3 hover:bg-white/60"
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Hint Text */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs text-[#5c3d2e] tracking-widest uppercase group-hover:bg-white/30 transition-all"
      >
        Click to explore
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SINGLE IMAGE COMPONENT
───────────────────────────────────────── */
function SingleImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-[380px] mx-auto"
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#d4c4b0]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full aspect-[4/5] object-cover grayscale-[25%] sepia-[20%] hover:grayscale-[10%] transition-all duration-700"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            (e.currentTarget.parentElement as HTMLElement).style.background = "linear-gradient(135deg, #e8d5c4, #d9c5b3)";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0e8]/60 via-transparent to-transparent" />
      </div>
      <div className="text-center mt-6">
        <h3 className="text-[clamp(28px,5vw,40px)] font-light italic text-[#5c3d2e] font-[Georgia]">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   COUNTDOWN CARD
───────────────────────────────────────── */
function Countdown() {
  const target = new Date("2026-07-05T06:30:00+05:30");
  const { days, hours, mins, secs } = useCountdown(target);
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Mins", value: mins },
    { label: "Secs", value: secs },
  ];
  return (
    <div className="mt-12 w-full max-w-md mx-auto no-print">
      <p className="text-center text-[#8b4513] font-[Georgia] italic text-sm mb-4 tracking-widest">Until the bells ring…</p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center bg-[#f5f0e8]/60 border border-[#8b4513]/20 rounded-2xl py-3 px-1 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
            <span className="text-3xl font-bold text-[#8b4513] font-[Georgia] tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-[#7a5a4a]/70 tracking-[0.2em] uppercase mt-1 font-[Georgia]">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[#8b4513]/40 text-[10px] mt-4 tracking-[0.2em] uppercase font-[Georgia]">July 05, 2026 · 6:30 AM</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function WeddingInvitation() {
  const [phase, setPhase] = useState<"envelope" | "opening" | "invite">("envelope");
  const [showConfetti, setShowConfetti] = useState(false);
  const [scratchedParts, setScratchedParts] = useState({ date: false, month: false, year: false });
  const storyRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Music State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Trigger confetti when all 3 are scratched
  useEffect(() => {
    if (scratchedParts.date && scratchedParts.month && scratchedParts.year) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5s
    }
  }, [scratchedParts]);

  const openEnvelope = () => {
    setPhase("opening");
    // Wait for the envelope animations to finish before fading to main invite
    setTimeout(() => {
      setPhase("invite");
      // Auto-play music when envelope opens (browsers usually allow this after user interaction)
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => console.log("Audio play prevented by browser"));
      }
    }, 3200); 
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadInvite = async () => {
    try {
      const element = downloadRef.current;
      if (!element) {
        alert("Invitation card not found");
        return;
      }

      // Wait for any animations to settle
      await new Promise(r => setTimeout(r, 300));

      const image = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fffaf5",
      });

      const link = document.createElement("a");
      link.href = image;
      link.download = "Wedding-Invitation-Kishore-Keerthana.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download invitation:", err);
      alert("Failed to download. Please try again.");
    }
  };

  const allScratched = scratchedParts.date && scratchedParts.month && scratchedParts.year;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        color: "#fff",
        overflowX: "hidden",
        position: "relative"
      }}
    >
      {/* PRINT STYLESHEET 
        This ensures ONLY the main invitation card prints. Everything else is hidden.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { 
            background: #fffaf5 !important; 
            color: #5c3d2e !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          
          /* Hide all sections by default */
          section { display: none !important; }
          
          /* Only show the print-card container */
          .print-card-section {
            display: flex !important;
            height: auto !important;
            align-items: center !important;
            justify-content: center !important;
            page-break-inside: avoid;
            background: #fffaf5 !important;
            padding: 40px 0 !important;
          }
          
          /* Force card styles for PDF/Paper */
          .print-card {
            background: #fffaf5 !important;
            border: 2px solid #8b4513 !important;
            box-shadow: none !important;
            color: #5c3d2e !important;
          }
          
          /* Force text colors inside the card */
          .print-card * {
            color: #5c3d2e !important;
            text-shadow: none !important;
          }
          .print-card h2 { color: #5c3d2e !important; font-weight: normal !important; }
          .print-card h3 { color: #5c3d2e !important; font-weight: normal !important; }
          .print-card p { color: #7a5a4a !important; }
          .print-card svg { stroke: #8b4513 !important; color: #8b4513 !important; }
          .print-icon-bg { background: #f5f0e8 !important; border: 2px solid #8b4513 !important; }
        }
      `}} />

      {/* --- AUDIO ELEMENT --- */}
      <audio ref={audioRef} loop src="/KK_Wedding_Invitation/wedding-music.mp3" />

      {/* --- MUSIC FLOATING BUTTON --- */}
      <div className="fixed top-6 right-6 z-50 no-print">
        <button 
          onClick={toggleMusic}
          className="p-3 rounded-full bg-[#8b4513]/10 border border-[#8b4513]/30 backdrop-blur-md text-[#8b4513] hover:bg-[#8b4513]/20 transition-all shadow-lg hover:shadow-xl"
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <AestheticBackground />
      {showConfetti && <ConfettiBurst />}

      {/* ── ENVELOPE PHASE & OPENING ANIMATION ── */}
      <AnimatePresence>
        {(phase === "envelope" || phase === "opening") && (
          <motion.div
            key="envelope-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center no-print"
            style={{ background: "linear-gradient(160deg, #faf8f5 0%, #f5f0e8 50%, #ede5dd 100%)" }}
          >
            <motion.div 
              animate={{ opacity: phase === "opening" ? 0 : 1, y: phase === "opening" ? -20 : 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-[15%] text-center"
            >
               <p style={{ color: "#8b4513", fontSize: 24, fontStyle: "italic", marginBottom: 8 }}>
                Kishore & Keerthana
              </p>
              <p style={{ color: "rgba(139,69,19,0.5)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                Wedding Invitation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 80, rotate: -5, scale: 0.9 }}
              animate={phase === "opening" ? { opacity: 1, y: -40, rotate: 0, scale: 1 } : { opacity: 0, y: 80, rotate: -5, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[280px] h-[160px] rounded-[2rem] bg-gradient-to-br from-[#f9f3eb] via-[#efe3d6] to-[#e7d4c0] border border-[#d4a574]/50 shadow-[0_25px_80px_rgba(0,0,0,0.12)] z-10"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_35%)]" />
              <div className="absolute inset-0 border border-white/20 rounded-[2rem]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 90, scale: 0.95, rotate: -3 }}
              animate={phase === "opening" ? { opacity: 1, y: -20, scale: 1, rotate: 0 } : { opacity: 0, y: 90, scale: 0.95, rotate: -3 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[260px] h-[150px] rounded-[2rem] bg-[#fff8f3] border border-[#e0c9af]/60 shadow-[0_18px_45px_rgba(0,0,0,0.12)] z-0"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white via-[#fff3e8] to-[#f3e0d3]" />
              <div className="absolute top-6 left-6 right-6 h-px bg-[#e5d0bb]/60" />
              <div className="absolute top-12 left-6 text-[#8b4513]/70 text-[10px] uppercase tracking-[0.35em]">A special invitation</div>
              <div className="absolute bottom-10 left-6 text-[#5c3d2e] text-[14px] font-semibold">Open to reveal the celebration</div>
            </motion.div>

            {/* Envelope Assembly */}
            <div className="relative w-[300px] h-[200px] mt-10 perspective-1000">
              <div className="absolute inset-0 bg-[#c9a876] rounded-lg shadow-2xl overflow-hidden border-2 border-[#a0715f]">
                 <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
              </div>

              <motion.div 
                initial={{ y: 10 }}
                animate={{ y: phase === "opening" ? -140 : 10, scale: phase === "opening" ? 1.05 : 1 }}
                transition={{ delay: phase === "opening" ? 0.8 : 0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-2 right-2 h-[180px] bg-gradient-to-b from-[#fef5ed] to-[#f5ede0] rounded-md shadow-inner flex flex-col items-center justify-center"
              >
                <div className="w-[90%] h-[90%] border-2 border-[#8b4513]/30 p-2 flex flex-col items-center justify-center">
                   <p className="text-[#5c3d2e] font-bold text-xl italic mb-1">K & K</p>
                   <p className="text-[#8b4513] text-[8px] uppercase tracking-widest">You're Invited</p>
                </div>
              </motion.div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" viewBox="0 0 300 200">
                <path d="M0,0 L150,110 L0,200 Z" fill="#a0715f" stroke="#d4a574" strokeWidth="1"/>
                <path d="M300,0 L150,110 L300,200 Z" fill="#a0715f" stroke="#d4a574" strokeWidth="1"/>
                <path d="M0,200 L150,110 L300,200 Z" fill="#8b6b5c" stroke="#d4a574" strokeWidth="1.5"/>
              </svg>

              <motion.div 
                className="absolute top-0 left-0 w-full h-[120px] origin-top drop-shadow-xl z-20"
                initial={{ rotateX: 0 }}
                animate={{ rotateX: phase === "opening" ? 180 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 backface-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <path d="M0,0 L150,120 L300,0 Z" fill="#b87d4c" stroke="#f5ede0" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="absolute inset-0 backface-hidden" style={{ transform: "rotateX(180deg)" }}>
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <path d="M0,120 L150,0 L300,120 Z" fill="#9a6f56" />
                  </svg>
                </div>
              </motion.div>

              <motion.div 
                animate={{ opacity: phase === "opening" ? 0 : 1, scale: phase === "opening" ? 0.8 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute top-[85px] left-[120px] w-[60px] h-[60px] z-30 cursor-pointer flex items-center justify-center"
                onClick={phase === "envelope" ? openEnvelope : undefined}
              >
                {/* Ripple effect on click */}
                <motion.div 
                  animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-[-15px] rounded-full border-2 border-[#d4a574]"
                />
                
                {/* Glow pulse */}
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-10px] rounded-full border border-[#d4a574]"
                />
                
                <motion.div 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#c49060] to-[#a0715f] shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-[#d4a574] flex items-center justify-center overflow-hidden"
                >
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent)]" />
                   <span className="text-[#f5ede0] font-[Georgia] text-xl font-bold italic tracking-tighter drop-shadow-md z-10">KK</span>
                </motion.div>
              </motion.div>
            </div>

            <motion.p 
              animate={{ opacity: phase === "opening" ? 0 : [0.4, 1, 0.4] }}
              transition={{ repeat: phase === "opening" ? 0 : Infinity, duration: 2 }}
              className="absolute bottom-[20%] text-[#8b4513] text-xs tracking-[0.3em] uppercase"
            >
              {phase === "opening" ? "Opening..." : "✦ Tap Seal to Open ✦"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN INVITATION ── */}
      <AnimatePresence>
        {phase === "invite" && (
          <motion.div
            key="invite"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10"
          >
            {/* ── HERO (Hidden on Print) ── */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center py-10 px-4 relative no-print">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
                <p className="text-[#8b4513] text-xs tracking-[0.5em] uppercase mb-6 font-[Georgia]">
                  ✦ A Love Story of ✦
                </p>

                <div className="flex items-center gap-4 justify-center mb-6">
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#8b4513]" />
                  <span className="text-[#8b4513] text-lg">❧</span>
                  <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#8b4513]" />
                </div>

                <h1 className="text-[clamp(42px,10vw,88px)] font-light italic leading-tight text-transparent bg-clip-text bg-gradient-to-br from-[#8b4513] via-[#a0522d] to-[#cd853f] mb-2 font-[Georgia]">
                  Kishore
                </h1>
                <p className="text-[#8b4513] text-[clamp(20px,5vw,36px)] tracking-[0.3em] my-2 font-[Georgia]">— & —</p>
                <h1 className="text-[clamp(42px,10vw,88px)] font-light italic leading-tight text-transparent bg-clip-text bg-gradient-to-br from-[#8b4513] via-[#a0522d] to-[#cd853f] mb-10 font-[Georgia]">
                  Keerthana
                </h1>

                <p className="text-[#7a5a4a] text-sm tracking-[0.4em] uppercase mb-10 font-[Georgia]">
                  Save The Date
                </p>

                {/* ── TRIPLE SCRATCH CARDS ── */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-row gap-3 md:gap-6 justify-center mb-4"
                  >
                    <ScratchBlock label="Date" value="05" onRevealed={() => setScratchedParts(p => ({...p, date: true}))} />
                    <ScratchBlock label="Month" value="July" onRevealed={() => setScratchedParts(p => ({...p, month: true}))} />
                    <ScratchBlock label="Year" value="2026" onRevealed={() => setScratchedParts(p => ({...p, year: true}))} />
                  </motion.div>

                  {!allScratched && (
                    <p className="text-[#a0715f]/60 text-[10px] tracking-[0.25em] uppercase mt-6 animate-pulse font-[Georgia]">
                      Scratch the golden cards to reveal
                    </p>
                  )}

                  {allScratched && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                      <Countdown />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </section>

            <div className="flex items-center gap-6 px-10 my-8 no-print">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#8b4513]/40" />
              <span className="text-[#8b4513] text-xl">✧</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#8b4513]/40" />
            </div>
#test
            {/* ── STORY SECTION (Hidden on Print) ── */}
            <section ref={storyRef} className="py-16 relative no-print">
              <div className="max-w-4xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.9 }}
                  className="text-center mb-24"
                >
                  <span className="inline-block bg-[#f5f0e8]/80 border border-[#8b4513]/30 text-[#8b4513] text-[10px] tracking-[0.4em] px-6 py-2 rounded-full uppercase mb-6 font-[Georgia]">
                    The Prelude
                  </span>
                  <h3 className="text-[clamp(26px,5vw,42px)] font-light italic text-[#5c3d2e] mb-4 font-[Georgia]">
                    It started in the hallways.
                  </h3>
                  <p className="text-[#7a5a4a] text-lg leading-relaxed font-light max-w-2xl mx-auto font-[Georgia]">
                    I saw her in schooling. At that time, I never could have imagined that the girl in the distance would one day become my life partner.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.9 }}
                  className="mb-24"
                >
                  <BackgroundImageGallery />
                </motion.div>

                <div className="text-center mb-24">
                  <Heart className="mx-auto text-[#8b4513] opacity-50" size={20} />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.9 }}
                  className="flex flex-col gap-12 items-center"
                >
                  <SingleImage src="/image2.png" alt="Engagement" title="The Forever Promise" />
                  <div className="text-center max-w-lg">
                    <p className="text-[#7a5a4a] text-base leading-relaxed font-light font-[Georgia]">
                      In front of our loved ones, we chose each other. A moment of pure joy that turned our love story into a lifelong commitment.
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ── INVITATION DETAILS CARD (THIS IS THE ONLY THING THAT PRINTS) ── */}
            <section className="print-card-section flex flex-col items-center py-16 px-5">
              <motion.div
                ref={downloadRef}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="print-card w-full max-w-2xl bg-gradient-to-br from-[#fffaf5] via-[#f5f0e8] to-[#ede5dd] border-2 border-[#8b4513]/40 rounded-[3rem] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-visible"
              >
                {/* Corner ornaments */}
                {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} text-[#8b4513]/40 text-2xl leading-none no-print`}>❧</div>
                ))}

                {/* Soft background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f5ede0]/40 to-[#e8dcc8]/30 rounded-[3rem]" />

                <div className="text-center mb-12 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-[#8b4513] text-sm tracking-[0.3em] uppercase mb-6 font-[Georgia]">With love and joy</p>
                    <h2 className="text-[clamp(24px,5vw,36px)] font-light italic text-[#5c3d2e] mb-2 font-[Georgia]">
                      Kishore & Keerthana
                    </h2>
                    <p className="text-[#8b4513] text-sm tracking-[0.2em] uppercase mb-8 font-[Georgia]">invite you to celebrate our wedding day</p>
                  </motion.div>

                  <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#8b4513]/30 to-transparent mx-auto mb-8" />

                  <h3 className="text-[clamp(28px,5vw,44px)] font-light italic text-[#5c3d2e] mb-6 font-[Georgia]">
                    at our Wedding Celebration
                  </h3>
                </div>

                <div className="border-t-2 border-b-2 border-[#8b4513]/20 py-10 mb-10 relative z-10">
                  {/* Reception */}
                  <div className="flex gap-6 mb-10 items-start">
                    <div className="print-icon-bg w-12 h-12 rounded-full bg-[#f5f0e8] border-2 border-[#8b4513]/30 flex items-center justify-center shrink-0 shadow-sm">
                      <Calendar className="text-[#8b4513]" size={20} />
                    </div>
                    <div>
                      <p className="text-[#8b4513] text-[9px] tracking-[0.35em] uppercase mb-2 font-[Georgia] font-semibold">Reception</p>
                      <p className="text-[#5c3d2e] text-base font-light font-[Georgia]">July 4, 2026 · 6:00 PM onwards</p>
                    </div>
                  </div>

                  {/* Muhurtham */}
                  <div className="flex gap-6 mb-10 items-start">
                    <div className="print-icon-bg w-12 h-12 rounded-full bg-[#f5f0e8] border-2 border-[#8b4513]/30 flex items-center justify-center shrink-0 shadow-sm">
                      <Clock className="text-[#8b4513]" size={20} />
                    </div>
                    <div>
                      <p className="text-[#8b4513] text-[9px] tracking-[0.35em] uppercase mb-2 font-[Georgia] font-semibold">Marriage Muhurtham</p>
                      <p className="text-[#5c3d2e] text-base font-light font-[Georgia]">July 5, 2026 · 6:00 AM – 7:30 AM</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex gap-6 items-start">
                    <div className="print-icon-bg w-12 h-12 rounded-full bg-[#f5f0e8] border-2 border-[#8b4513]/30 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="text-[#8b4513]" size={20} />
                    </div>
                    <div>
                      <p className="text-[#8b4513] text-[9px] tracking-[0.35em] uppercase mb-2 font-[Georgia] font-semibold">The Venue</p>
                      <p className="text-[#5c3d2e] text-base font-light leading-relaxed font-[Georgia]">
                        PMS Salammal Kalyana Mandapam,<br/>
                        Pichanoor Pet, Gopalapuram,<br/>
                        Gudiyattam, Tamil Nadu 632602
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center italic text-[#7a5a4a] text-base leading-relaxed relative z-10 font-[Georgia]">
                  "Your presence will make our celebration complete."
                </p>
              </motion.div>

              {/* Action Buttons (Locate & Download) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-10 w-full max-w-2xl flex flex-col sm:flex-row gap-4 no-print"
              >
                <a
                  href="https://maps.app.goo.gl/DmmtTD1noYYYyxRe8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#8b4513] to-[#6b3410] hover:from-[#9c5c2f] hover:to-[#7c4319] transition-all rounded-2xl text-white font-[Georgia] text-xs tracking-[0.2em] uppercase shadow-[0_6px_20px_rgba(139,69,19,0.3)] border border-[#8b4513]/30 hover:shadow-[0_10px_30px_rgba(139,69,19,0.4)]"
                >
                  <MapPin size={16} /> Locate Venue
                </a>
                
                <motion.button
                  onClick={downloadInvite}
                  whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(139,69,19,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-br from-[#d4a574] via-[#c49060] to-[#b87d4c] hover:from-[#e8b88a] hover:via-[#daa976] hover:to-[#cd9460] transition-all rounded-2xl text-[#f5f0e8] font-[Georgia] text-xs tracking-[0.2em] uppercase shadow-[0_6px_25px_rgba(139,69,19,0.35)] border border-[#f5f0e8]/40 font-semibold"
                >
                  <Download size={16} /> Download Invitation
                </motion.button>
              </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="text-center py-12 px-6 text-[#8b4513]/50 text-[10px] tracking-[0.3em] uppercase border-t border-[#8b4513]/10 mt-12 no-print font-[Georgia]">
              <div className="flex items-center gap-4 justify-center mb-4">
                <div className="h-[1px] w-10 bg-[#8b4513]/30" />
                <span className="text-[#8b4513] text-lg">❧</span>
                <div className="h-[1px] w-10 bg-[#8b4513]/30" />
              </div>
              Kichu Keerthana · 2026 · With Love ❤️
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
