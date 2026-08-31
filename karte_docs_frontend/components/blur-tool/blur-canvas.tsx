'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, Trash2, Check, MousePointer2, 
  Square, ArrowUpRight, Shaler, Type, 
  Ban
} from 'lucide-react';

type ToolMode = 'BLUR' | 'RECT' | 'ARROW';

interface BlurCanvasProps {
  onSave: (blob: Blob) => void;
}

export function BlurCanvas({ onSave }: BlurCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<ToolMode>('BLUR');
  const [color, setColor] = useState('#ef4444'); // Default Red
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // Load image into canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        setImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startAction = (e: React.MouseEvent) => {
    if (!image) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current?.getContext('2d');
    
    // Take a snapshot of the canvas before drawing (for real-time preview)
    if (ctx && canvasRef.current) {
      setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
    
    setStartPos(pos);
    setIsDrawing(true);
  };

  const drawAction = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current || !snapshot) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPos = getMousePos(e);
    
    // Restore the canvas to the state before this stroke started
    ctx.putImageData(snapshot, 0, 0);

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    if (mode === 'RECT') {
      ctx.strokeRect(startPos.x, startPos.y, currentPos.x - startPos.x, currentPos.y - startPos.y);
    } 
    else if (mode === 'ARROW') {
      drawArrow(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
    }
    else if (mode === 'BLUR') {
      // For blur, we draw a translucent placeholder box while dragging
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(startPos.x, startPos.y, currentPos.x - startPos.x, currentPos.y - startPos.y);
    }
  };

  const endAction = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (mode === 'BLUR') {
      const endPos = getMousePos(e);
      applyBlurEffect(ctx, startPos.x, startPos.y, endPos.x - startPos.x, endPos.y - startPos.y);
    }

    setIsDrawing(false);
    setSnapshot(null);
  };

  const applyBlurEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = 'blur(15px)';
    ctx.drawImage(canvasRef.current!, 0, 0);
    ctx.restore();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleFinish = () => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/png');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-800 p-2 rounded-lg gap-3">
        <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
          <input type="file" id="image-upload" hidden onChange={handleImageUpload} accept="image/*" />
          <Button variant="secondary" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Upload
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setImage(null); setSnapshot(null); }} className="text-red-400 hover:bg-red-400/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md">
          <ToolButton active={mode === 'BLUR'} onClick={() => setMode('BLUR')} icon={<Ban className="h-4 w-4" />} label="Blur" />
          <ToolButton active={mode === 'RECT'} onClick={() => setMode('RECT')} icon={<Square className="h-4 w-4" />} label="Box" />
          <ToolButton active={mode === 'ARROW'} onClick={() => setMode('ARROW')} icon={<ArrowUpRight className="h-4 w-4" />} label="Arrow" />
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          {['#ef4444', '#eab308', '#22c55e', '#3b82f6'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white' : 'border-transparent opacity-50'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Button variant="default" size="sm" onClick={handleFinish} disabled={!image} className="bg-emerald-600 hover:bg-emerald-500 ml-auto">
          <Check className="h-4 w-4 mr-2" /> Done
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="relative border-2 border-dashed border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex justify-center min-h-[300px]">
        {!image && (
          <div className="py-20 text-slate-600 flex flex-col items-center">
            <Upload className="h-12 w-12 mb-2 opacity-20" />
            <p>Upload a screenshot to begin editing</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startAction}
          onMouseMove={drawAction}
          onMouseUp={endAction}
          onMouseLeave={() => setIsDrawing(false)}
          className={`max-w-full h-auto ${image ? 'cursor-crosshair' : 'hidden shadow-2xl'}`}
        />
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: any) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 px-3 gap-2 ${active ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </Button>
  );
}