import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { mountMeteorTrail } from '../utils/meteorTrail';
import './MouseMeteorTrail.css';

export function MouseMeteorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) return mountMeteorTrail(canvasRef.current);
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <canvas ref={canvasRef} className="mouse-meteor-trail" aria-hidden="true" />,
    document.body,
  );
}
