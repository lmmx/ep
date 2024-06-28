'use client';

import { useEffect, useRef } from 'react';
import { loadEmbeddingsInChunks, ChunkData } from '../lib/dataLoader';

export default function Projector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    async function project() {
      for await (const { progress, chunk, nSamples, nDimensions } of loadEmbeddingsInChunks()) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw points
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        for (let i = 0; i < chunk.length; i += nDimensions) {
          const x = (chunk[i] + 1) * canvas.width / 2;
          const y = (chunk[i + 1] + 1) * canvas.height / 2;
          ctx.fillRect(x, y, 2, 2);
        }

        // Draw progress bar
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(0, canvas.height - 10, canvas.width * progress, 10);

        // Wait for next frame
        await new Promise<void>(resolve => {
          animationFrameId = requestAnimationFrame(() => resolve());
        });
      }
    }

    project();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-auto border border-gray-300 rounded shadow-lg"
      />
    </div>
  );
}
