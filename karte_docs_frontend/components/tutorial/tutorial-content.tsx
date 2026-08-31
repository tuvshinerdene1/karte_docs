'use client';

import React from 'react';

interface TutorialContentProps {
  content: string;
}

export function TutorialContent({ content }: TutorialContentProps) {
  return (
    <div 
      // We use the 'tiptap' class so your globals.css styles (lists/headers) apply here too
      // We use 'prose-invert' because your UI is dark mode
      className="tiptap prose prose-invert prose-blue max-w-none 
                 prose-p:text-slate-300 prose-p:leading-relaxed 
                 prose-headings:text-white prose-strong:text-white 
                 prose-img:rounded-2xl prose-img:border prose-img:border-slate-800 prose-img:shadow-2xl"
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}