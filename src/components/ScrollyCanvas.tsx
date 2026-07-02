import React, { useRef, useEffect, useState } from "react";
import { MotionValue, useMotionValueEvent } from "motion/react";

interface ScrollyCanvasProps {
  scrollYProgress: MotionValue<number>;
}

/**
 * Lerp factor per RAF tick (60fps assumed).
 * 0.15 → catches up ~90% in ~15 frames (~250ms) — cinematic, not laggy.
 */
const LERP_FACTOR = 0.15;

function padIndex(i: number) {
  return String(i).padStart(3, "0");
}

/** Object-fit: cover draw — covers any canvas size with image */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const iw = img.naturalWidth  || 1920;
  const ih = img.naturalHeight || 1080;
  const scale = Math.max(cw / iw, ch / ih);
  const dx = (cw - iw * scale) / 2;
  const dy = (ch - ih * scale) / 2;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, iw * scale, ih * scale);
}

// ─── Single reusable canvas hook ─────────────────────────────────────────────
function useScrollyCanvas(
  scrollYProgress: MotionValue<number>,
  folder: string,          // "/webp" or "/mobp"
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,        // mount/unmount control — skip if not visible
  isMobile: boolean,
  totalFrames: number      // e.g. 50 on desktop, 20 on mobile for performance
) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady,     setIsReady]     = useState(false);

  const ctxRef         = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef      = useRef<HTMLImageElement[]>([]);
  const currentFloat   = useRef(0);
  const targetFrame    = useRef(0);
  const lastDrawn      = useRef(-1);
  const rafId          = useRef<number | null>(null);

  // 1. Preload all frames from the given folder (downsampled on mobile)
  useEffect(() => {
    if (!enabled) return;
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.decoding = "async";

      // Map i (1...totalFrames) to disk frame index (1...50)
      const fileIdx = totalFrames === 50
        ? i
        : Math.min(50, Math.round(((i - 1) * 49) / (totalFrames - 1)) + 1);

      img.src = `${folder}/ezgif-frame-${padIndex(fileIdx)}.png`;
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded % 5 === 0 || loaded === totalFrames) {
          setLoadedCount(loaded);
        }
        if (loaded === totalFrames) setIsReady(true);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
    // reset on remount
    return () => { setIsReady(false); setLoadedCount(0); };
  }, [folder, enabled, totalFrames]);

  // 2. Canvas context + resize
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = isMobile ? "medium" : "high"; // faster smoothing on mobile

    const resize = () => {
      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);
      const dpr = isMobile ? Math.min(baseDpr, 1) : baseDpr; // cap mobile DPR at 1 to save pixels
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const img = imagesRef.current[Math.round(currentFloat.current)];
      if (img?.complete && img.naturalWidth > 0 && ctxRef.current) {
        drawCover(ctxRef.current, img);
        lastDrawn.current = Math.round(currentFloat.current);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => window.removeEventListener("resize", resize);
  }, [enabled, isMobile]);

  // 3. Map scroll → target frame (ref only, zero re-renders)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!enabled) return;
    targetFrame.current = Math.min(
      totalFrames - 1,
      Math.max(0, latest * (totalFrames - 1))
    );
  });

  // 4. RAF loop — pure refs, no React state in hot-path
  useEffect(() => {
    if (!isReady || !enabled) return;

    // Snappier catch-up on mobile to prevent scrolling lag sensation
    const lerpFactor = isMobile ? 0.22 : LERP_FACTOR;

    const loop = () => {
      currentFloat.current +=
        (targetFrame.current - currentFloat.current) * lerpFactor;
      const frameIdx = Math.round(currentFloat.current);
      if (frameIdx !== lastDrawn.current) {
        const img = imagesRef.current[frameIdx];
        if (img?.complete && img.naturalWidth > 0 && ctxRef.current) {
          drawCover(ctxRef.current, img);
          lastDrawn.current = frameIdx;
        }
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [isReady, enabled, isMobile, totalFrames]);

  return { loadedCount, isReady };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ScrollyCanvas({ scrollYProgress }: ScrollyCanvasProps) {
  const desktopCanvasRef = useRef<HTMLCanvasElement>(null);
  const mobileCanvasRef  = useRef<HTMLCanvasElement>(null);

  // Detect viewport — only one canvas runs at a time (saves RAM + GPU)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Desktop canvas — /webp/ landscape frames (hidden on mobile)
  const { loadedCount: dLoaded, isReady: dReady } = useScrollyCanvas(
    scrollYProgress,
    "/webp",
    desktopCanvasRef,
    !isMobile,
    isMobile,
    50
  );

  // Mobile canvas — /mobp/ portrait frames (hidden on desktop)
  // We use 20 frames on mobile for 60% memory/bandwidth savings and fast rendering!
  const mobileFrames = 20;
  const { loadedCount: mLoaded, isReady: mReady } = useScrollyCanvas(
    scrollYProgress,
    "/mobp",
    mobileCanvasRef,
    isMobile,
    isMobile,
    mobileFrames
  );

  const loadedCount = isMobile ? mLoaded : dLoaded;
  const totalFrames = isMobile ? mobileFrames : 50;
  const isReady     = isMobile ? mReady  : dReady;

  return (
    <>
      {/* ── Loading screen — shown until active canvas is ready ── */}
      {!isReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1020]">
          <div className="w-16 h-16 rounded-full bg-[#003F7F]/20 border border-[#0E8ACF]/30 flex items-center justify-center mb-6">
            <span className="text-[#FF7A1A] font-display font-black text-lg animate-pulse">
              PVE
            </span>
          </div>
          <div className="relative w-64 h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#003F7F] via-[#0E8ACF] to-[#FF7A1A] transition-[width] duration-100 ease-out"
              style={{ width: `${Math.round((loadedCount / totalFrames) * 100)}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-neutral-300 uppercase tracking-[0.25em]">
            Loading Export Journey&hellip;{" "}
            {Math.round((loadedCount / totalFrames) * 100)}%
          </p>
        </div>
      )}

      {/* ── Desktop canvas — landscape /webp/ frames ── */}
      <canvas
        ref={desktopCanvasRef}
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: "contents" }}
      />

      {/* ── Mobile canvas — portrait /mobp/ frames ── */}
      <canvas
        ref={mobileCanvasRef}
        className="md:hidden absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: "contents" }}
      />
    </>
  );
}
