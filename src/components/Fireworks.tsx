import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'];

    function createFirework(x: number, y: number) {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 3 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.life -= 0.01;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(animate);
    }

    const fireworkInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) { // spawn 3 at once
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.7);
        createFirework(x, y);
      }
    }, 400);


    let animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(fireworkInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}
