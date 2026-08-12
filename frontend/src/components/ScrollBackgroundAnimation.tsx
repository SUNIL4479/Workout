import { useEffect, useRef } from "react";

const frameModules = import.meta.glob("../assets/pushup_frames/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const ALL_FRAME_URLS = Object.keys(frameModules)
  .sort(
    (a, b) =>
      Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0)
  )
  .map((key) => frameModules[key]);

type DeviceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export const ScrollBackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const statusRef = useRef<number[]>([]); // 0 idle, -1 loading, 1 ready, 2 failed
  const targetRef = useRef(0);
  const shownRef = useRef(0);
  const lastDrawnRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const device = navigator as DeviceNavigator;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowMemory = (device.deviceMemory ?? 8) <= 4 || device.connection?.saveData === true;
    const constrained = isMobile || lowMemory || prefersReducedMotion;

    // A phone needs far fewer frames than a desktop to look fluid, and limiting the
    // sequence keeps decoded images from consuming hundreds of MB of RAM.
    const frameLimit = constrained ? 54 : 150;
    const frameStep = Math.max(1, Math.ceil(ALL_FRAME_URLS.length / frameLimit));
    const frameUrls = ALL_FRAME_URLS.filter(
      (_, index) => index % frameStep === 0 || index === ALL_FRAME_URLS.length - 1
    );
    const count = frameUrls.length;
    const concurrency = constrained ? 2 : 5;
    const easing = constrained ? 1 : 0.2;
    const fitEntireFrame = isMobile;

    contextRef.current = canvas.getContext("2d", { alpha: false });
    const ctx = contextRef.current;
    if (!ctx) return;

    statusRef.current = new Array(count).fill(0);
    framesRef.current = new Array(count).fill(null);
    targetRef.current = 0;
    shownRef.current = 0;
    lastDrawnRef.current = -1;
    let cancelled = false;
    let rafId = 0;
    let resizeRafId = 0;
    let activeLoads = 0;
    let nextFrameToLoad = 0;

    const draw = (force = false) => {
      const target = Math.round(shownRef.current);
      let index = target;
      while (index >= 0 && statusRef.current[index] !== 1) index -= 1;
      if (index < 0) return;
      if (!force && lastDrawnRef.current === index) return;

      const image = framesRef.current[index];
      if (!image?.naturalWidth) return;

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let sx = 0;
      let sy = 0;
      let sw = image.naturalWidth;
      let sh = image.naturalHeight;
      let dx = 0;
      let dy = 0;
      let dw = canvas.width;
      let dh = canvas.height;

      if (fitEntireFrame) {
        // Never crop the workout movement on a narrow screen.
        if (imageRatio > canvasRatio) {
          dh = canvas.width / imageRatio;
          dy = (canvas.height - dh) / 2;
        } else {
          dw = canvas.height * imageRatio;
          dx = (canvas.width - dw) / 2;
        }
      } else if (imageRatio > canvasRatio) {
        sw = sh * canvasRatio;
        sx = (image.naturalWidth - sw) / 2;
      } else {
        sh = sw / canvasRatio;
        sy = (image.naturalHeight - sh) / 2;
      }

      ctx.imageSmoothingEnabled = !constrained;
      if (!constrained) ctx.imageSmoothingQuality = "medium";
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      lastDrawnRef.current = index;
    };

    const resize = () => {
      if (!window.innerWidth || !window.innerHeight) return;
      // Rendering at native DPR on small screens creates a very large canvas. A
      // single physical pixel is sharper enough for a background and much cheaper.
      const dpr = constrained ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
      lastDrawnRef.current = -1;
      draw(true);
    };

    const updateFromScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      targetRef.current = progress * (count - 1);
    };

    const loadNext = () => {
      while (!cancelled && activeLoads < concurrency && nextFrameToLoad < count) {
        const index = nextFrameToLoad++;
        const image = new Image();
        image.decoding = "async";
        statusRef.current[index] = -1;
        activeLoads += 1;

        const finish = (ready: boolean) => {
          if (cancelled) return;
          statusRef.current[index] = ready ? 1 : 2;
          activeLoads -= 1;
          // Redraw only when this is the frame currently needed; loading frames in
          // the background must not steal time from a user's scroll gesture.
          if (index === Math.round(shownRef.current)) draw(true);
          loadNext();
        };

        image.onload = () => finish(true);
        image.onerror = () => finish(false);
        image.src = frameUrls[index];
        framesRef.current[index] = image;
      }
    };

    const tick = () => {
      const difference = targetRef.current - shownRef.current;
      if (Math.abs(difference) <= 0.05) {
        shownRef.current = targetRef.current;
      } else {
        shownRef.current += difference * easing;
      }
      draw();

      if (!constrained && Math.abs(targetRef.current - shownRef.current) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        shownRef.current = targetRef.current;
        draw();
        rafId = 0;
      }
    };

    let scrolling = false;
    const onScroll = () => {
      if (scrolling) return;
      scrolling = true;
      requestAnimationFrame(() => {
        scrolling = false;
        updateFromScroll();
        if (constrained) {
          shownRef.current = targetRef.current;
          draw();
        } else if (!rafId) {
          rafId = requestAnimationFrame(tick);
        }
      });
    };

    const onResize = () => {
      if (resizeRafId) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = 0;
        resize();
        updateFromScroll();
      });
    };

    resize();
    updateFromScroll();
    loadNext();
    if (!prefersReducedMotion) rafId = requestAnimationFrame(tick);
    else draw(true);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      framesRef.current.forEach((image) => {
        if (image) {
          image.onload = null;
          image.onerror = null;
        }
      });
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-[#050505]/25" />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 180px 50px rgba(0, 0, 0, 0.35)" }} />
    </div>
  );
};
