import ReactMarkdown from 'react-markdown';

export function TutorialContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      {/* This will turn ![alt](url) into <img src="url" /> automatically */}
      <ReactMarkdown 
        components={{
          img: ({node, ...props}) => (
            <img {...props} className="rounded-xl border border-slate-800 my-8 shadow-2xl" alt="Tutorial Illustration" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}