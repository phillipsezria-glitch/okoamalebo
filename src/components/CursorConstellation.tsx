'use client';

import { useEffect, useRef } from 'react';

const MAX_PARTICLES = 34;

export function CursorConstellation() {
  const layerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const createParticle = (x: number, y: number, burst = false) => {
      const particle = document.createElement('span');
      const size = burst ? 2 + Math.random() * 3.5 : 2 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      const distance = burst ? 18 + Math.random() * 34 : 18 + Math.random() * 42;
      const driftX = Math.cos(angle) * distance;
      const driftY = Math.sin(angle) * distance;
      const duration = burst ? 520 + Math.random() * 260 : 700 + Math.random() * 450;

      particle.className = burst ? 'constellation-particle constellation-burst' : 'constellation-particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty('--drift-x', `${driftX}px`);
      particle.style.setProperty('--drift-y', `${driftY}px`);
      particle.style.animationDuration = `${duration}ms`;
      particle.style.animationDelay = `${Math.random() * (burst ? 45 : 80)}ms`;
      particle.addEventListener('animationend', () => {
        particle.remove();
        particlesRef.current = particlesRef.current.filter(activeParticle => activeParticle !== particle);
      }, { once: true });

      layer.appendChild(particle);
      particlesRef.current.push(particle);

      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current.shift()?.remove();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || document.documentElement.dataset.theme !== 'dark') return;

      const now = performance.now();
      const previous = lastPointRef.current;
      const distance = Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
      if (distance < 14 || now - lastSpawnRef.current < 34) return;

      lastPointRef.current = { x: event.clientX, y: event.clientY };
      lastSpawnRef.current = now;
      createParticle(event.clientX, event.clientY);
    };

    const createBurst = (x: number, y: number) => {
      for (let index = 0; index < 6; index += 1) {
        createParticle(x, y, true);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      createBurst(event.clientX, event.clientY);
    };

    const handleClick = (event: MouseEvent) => {
      createBurst(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('click', handleClick);
      particlesRef.current.forEach(particle => particle.remove());
      particlesRef.current = [];
    };
  }, []);

  return <div ref={layerRef} className="constellation-layer" aria-hidden="true" />;
}
