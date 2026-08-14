export function TutorialContent({content}:{content: string}){
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      {/* 
          Note: In a real app, you would use a library like 'react-markdown' here 
          to render the content safely. For now, we'll assume it's text.
      */}
      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
        {content}
      </div>
    </div>
  );
}