'use client';
import React, {useRef, useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import { Download, Eraser, Trash2, Check, Upload } from 'lucide-react';

interface BlurCanvasProps {
    onSave: (blob: Blob) => void;
}

export function BlurCanvas({onSave}:BlurCanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement| null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({x:0, y:0});

    // load image into canvas
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file){
            console.log("image not uploaded");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () =>{
                const canvas = canvasRef.current;
                if (!canvas) return;

                // scale canvas to image size
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                setImage(img);
            };
            img.src = event.target?.result as string;
        }
        reader.readAsDataURL(file);
    };

    const startBlurring = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        setStartPos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
        setIsDrawing(true);
    };

    const applyBlur = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;

        const width = endX - startPos.x;
        const height = endY - startPos.y;

        // apply blur effect to the selected rectangle
        ctx.save();
        ctx.beginPath();
        ctx.rect(startPos.x, startPos.y, width, height);
        ctx.clip();

        // draw the image onto itself with a blur filter
        ctx.filter = 'blur(15px)';
        ctx.drawImage(canvas,0,0);
        ctx.restore();

        setIsDrawing(false);
    };

    const handleFinish = () => {
        canvasRef.current?.toBlob((blob) => {
            if (blob) onSave(blob);
        }, 'image/png');
    };

     return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
        <div className="flex gap-2">
            <input 
                type="file" 
                id="image-upload" 
                hidden 
                onChange={handleImageUpload} 
                accept="image/*"
            />
            <Button variant="secondary" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Upload Screenshot
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setImage(null)} className="text-red-400">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
        
        {image && (
            <Button variant="default" size="sm" onClick={handleFinish} className="bg-emerald-600">
                <Check className="h-4 w-4 mr-2" /> Done & Insert
            </Button>
        )}
      </div>

      <div className="relative border-2 border-dashed border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex justify-center">
        {!image && (
            <div className="py-20 text-slate-600 flex flex-col items-center">
                <Upload className="h-12 w-12 mb-2 opacity-20" />
                <p>Upload an image to redact sensitive data</p>
            </div>
        )}
        <canvas 
          ref={canvasRef}
          onMouseDown={startBlurring}
          onMouseUp={applyBlur}
          className={`max-w-full h-auto ${image ? 'cursor-crosshair' : 'hidden'}`}
        />
      </div>
      {image && <p className="text-[10px] text-slate-500 text-center">Click and drag to draw blur boxes over sensitive info.</p>}
    </div>
  );
}