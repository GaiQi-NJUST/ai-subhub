/** A short, quiet cursor trail. No dependencies and no animation work while idle. */
export function mountMeteorTrail(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const lifetime = 380;
  const maxLength = 100;
  const maxPoints = 40;
  type Point = { x: number; y: number; time: number };
  let points: Point[] = [];
  let previous: Point | null = null;
  let frame = 0;
  let width = 0;
  let height = 0;

  const enabled = () => !reducedMotion.matches && finePointer.matches && !document.hidden;
  const clear = () => ctx.clearRect(0, 0, width, height);

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    points = [];
    previous = null;
    clear();
  }

  function resize() {
    reset();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function trim() {
    let length = 0;
    for (let i = points.length - 1; i > 0; i--) {
      length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      if (length > maxLength) {
        points.splice(0, i);
        break;
      }
    }
    if (points.length > maxPoints) points.splice(0, points.length - maxPoints);
  }

  function draw(now: number) {
    frame = 0;
    clear();
    points = points.filter(point => now - point.time < lifetime);
    if (!enabled() || points.length < 2) {
      points = [];
      return;
    }

    const head = points[points.length - 1];
    const fade = Math.pow(Math.max(0, 1 - (now - head.time) / lifetime), 1.6);
    ctx!.lineCap = 'round';
    ctx!.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const progress = i / (points.length - 1);
      const age = Math.max(0, 1 - (now - b.time) / lifetime);
      const opacity = 0.48 * progress * age * fade;
      // Muted violet at the tapered tail, blue in the middle, mint at the head.
      const hue = 268 - progress * 108;
      ctx!.strokeStyle = `hsla(${hue}, 72%, 56%, ${opacity * 0.12})`;
      ctx!.lineWidth = 3 + progress * 3;
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.stroke();
      ctx!.strokeStyle = `hsla(${hue}, 72%, 48%, ${opacity})`;
      ctx!.lineWidth = 0.25 + progress * 1.25;
      ctx!.stroke();
    }

    const glow = ctx!.createRadialGradient(head.x, head.y, 0, head.x, head.y, 5);
    glow.addColorStop(0, `rgba(52, 211, 153, ${0.38 * fade})`);
    glow.addColorStop(0.35, `rgba(94, 234, 212, ${0.14 * fade})`);
    glow.addColorStop(1, 'rgba(94, 234, 212, 0)');
    ctx!.fillStyle = glow;
    ctx!.beginPath();
    ctx!.arc(head.x, head.y, 5, 0, Math.PI * 2);
    ctx!.fill();
    frame = requestAnimationFrame(draw);
  }

  function onMove(event: PointerEvent) {
    if (!enabled() || event.pointerType !== 'mouse' || event.buttons !== 0) {
      reset();
      return;
    }
    const current = { x: event.clientX, y: event.clientY, time: performance.now() };
    if (!previous || current.time - previous.time > lifetime) {
      previous = current;
      points = [current];
      return;
    }
    const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
    if (distance < 0.6) return;
    // Never bridge a jump between windows or re-entry on the other side of the page.
    if (distance > 240) {
      reset();
      previous = current;
      points = [current];
      return;
    }
    if (!points.length) points.push(previous);
    const steps = Math.min(32, Math.max(1, Math.ceil(distance / 3)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: previous.x + (current.x - previous.x) * t,
        y: previous.y + (current.y - previous.y) * t,
        time: previous.time + (current.time - previous.time) * t,
      });
    }
    previous = current;
    trim();
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function onPointerOut(event: PointerEvent) {
    if (!event.relatedTarget) reset();
  }

  resize();
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerout', onPointerOut, { passive: true });
  window.addEventListener('pointerdown', reset, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', reset, { passive: true, capture: true });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);

  return () => {
    reset();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerout', onPointerOut);
    window.removeEventListener('pointerdown', reset);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', reset, true);
    window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', reset);
    reducedMotion.removeEventListener('change', reset);
    finePointer.removeEventListener('change', reset);
  };
}
