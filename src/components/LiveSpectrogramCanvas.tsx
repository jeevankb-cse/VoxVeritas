import React, { useEffect, useRef } from 'react';
import { Volume2, Sliders, Waves } from 'lucide-react';

interface LiveSpectrogramCanvasProps {
  analyser: AnalyserNode | null;
  isStreaming: boolean;
  activeLabel?: 'human' | 'ai' | 'ambient';
}

export const LiveSpectrogramCanvas: React.FC<LiveSpectrogramCanvasProps> = ({
  analyser,
  isStreaming,
  activeLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const historyRef = useRef<Uint8Array[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 512;
    let dataArray = new Uint8Array(bufferLength);
    let timeDataArray = new Uint8Array(bufferLength);

    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      timeDataArray = new Uint8Array(bufferLength);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Handle retina resolution
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== canvas.clientWidth * dpr) {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      if (analyser && isStreaming) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeDataArray);

        // Keep waterfall history
        const row = new Uint8Array(128);
        for (let i = 0; i < 128; i++) {
          row[i] = dataArray[Math.floor((i / 128) * (bufferLength / 2))];
        }
        historyRef.current.unshift(row);
        if (historyRef.current.length > 50) {
          historyRef.current.pop();
        }
      } else {
        // Subtle ambient resting wave
        for (let i = 0; i < timeDataArray.length; i++) {
          timeDataArray[i] = 128 + Math.sin(i * 0.05 + Date.now() * 0.003) * 3;
        }
      }

      // Draw Grid Lines & Frequencies
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const freqLabels = ['0 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz'];
      freqLabels.forEach((label, idx) => {
        const x = (idx / (freqLabels.length - 1)) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(label, Math.min(x + 4, width - 42), height - 8);
      });

      // 1. Draw Waterfall Spectrogram (Bottom 60% of canvas)
      const waterfallTop = height * 0.35;
      const waterfallHeight = height * 0.65;
      const rows = historyRef.current;
      const numRows = rows.length;

      if (numRows > 0) {
        const rowH = waterfallHeight / 50;
        for (let r = 0; r < numRows; r++) {
          const rowData = rows[r];
          const y = waterfallTop + r * rowH;
          const colW = width / rowData.length;

          for (let c = 0; c < rowData.length; c++) {
            const val = rowData[c];
            if (val > 10) {
              const intensity = val / 255;
              // Heatmap: dark blue -> cyan -> amber -> crimson
              let rCol = 0;
              let gCol = 0;
              let bCol = 0;

              if (activeLabel === 'ai') {
                // Crimson / violet tint for synthetic
                rCol = Math.floor(255 * intensity);
                gCol = Math.floor(60 * intensity);
                bCol = Math.floor(180 * intensity);
              } else {
                // Emerald / cyan tint for human
                rCol = Math.floor(30 * intensity);
                gCol = Math.floor(230 * intensity);
                bCol = Math.floor(180 * intensity);
              }

              ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${intensity * 0.9})`;
              ctx.fillRect(c * colW, y, colW + 1, rowH + 1);
            }
          }
        }
      }

      // Vocoder 7.5 kHz Cutoff Line Indicator
      const cutoffX = width * 0.88;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = activeLabel === 'ai' ? '#f43f5e' : '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cutoffX, 0);
      ctx.lineTo(cutoffX, height);
      ctx.stroke();

      ctx.fillStyle = activeLabel === 'ai' ? '#f43f5e' : '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText('7.5 kHz Vocoder Boundary', cutoffX - 130, 20);
      ctx.restore();

      // 2. Draw Oscilloscope Waveform (Top 35% of canvas)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle =
        activeLabel === 'ai'
          ? '#f43f5e'
          : activeLabel === 'human'
          ? '#10b981'
          : '#38bdf8';

      const sliceWidth = width / timeDataArray.length;
      let x = 0;

      for (let i = 0; i < timeDataArray.length; i++) {
        const v = timeDataArray[i] / 128.0; // 0 - 2
        const y = (v * (waterfallTop * 0.7)) / 2 + waterfallTop * 0.15;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      // Horizontal separator line between Waveform and Spectrogram
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, waterfallTop);
      ctx.lineTo(width, waterfallTop);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser, isStreaming, activeLabel]);

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
      {/* Visualizer Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Waves className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">
            Real-Time Oscilloscope & Spectral Waterfall
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            (Sliding Window 100ms - 500ms)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1 text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>FFT 1024 Bins</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>0 - 16 kHz</span>
          </div>
        </div>
      </div>

      {/* Canvas Element */}
      <div className="relative h-56 sm:h-64 w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Legend overlays */}
        <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-sky-300 border border-slate-700 backdrop-blur-sm">
            WAVEFORM ENVELOPE
          </span>
        </div>
        <div className="absolute top-[40%] left-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-indigo-300 border border-slate-700 backdrop-blur-sm">
            SPECTRAL WATERFALL DENSITY
          </span>
        </div>
      </div>
    </div>
  );
};
