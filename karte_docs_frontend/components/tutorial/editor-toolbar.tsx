'use client';

import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Heading3, 
  Undo, Redo, Quote 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border-b border-slate-800 rounded-t-md sticky top-0 z-10">
      {/* Headings */}
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="w-px bg-slate-800 mx-1 self-stretch my-1" />

      {/* Formatting */}
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="w-px bg-slate-800 mx-1 self-stretch my-1" />

      {/* Lists */}
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px bg-slate-800 mx-1 self-stretch my-1" />

      {/* History */}
      <Button 
        type="button" variant="ghost" size="sm" 
        onClick={() => editor.chain().focus().undo().run()} 
        className="text-slate-400"
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button 
        type="button" variant="ghost" size="sm" 
        onClick={() => editor.chain().focus().redo().run()} 
        className="text-slate-400"
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}