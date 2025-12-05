import React from 'react';

interface GlitchTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, as: Tag = 'span', className = '' }) => {
  return (
    <Tag className={`relative inline-block ${className} group`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-red-500 opacity-0 group-hover:opacity-70 animate-pulse z-0">
        {text}
      </span>
      <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-cyan-500 opacity-0 group-hover:opacity-70 animate-pulse delay-75 z-0">
        {text}
      </span>
    </Tag>
  );
};

export default GlitchText;