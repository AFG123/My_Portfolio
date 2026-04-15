interface SkillTagProps {
  skill: string;
  highlight?: boolean;
}

export function SkillTag({ skill, highlight }: SkillTagProps) {
  return (
    <div className={`font-mono text-sm px-3 py-2 border transition-colors ${
      highlight 
        ? 'border-[#00ff41] bg-[#00ff41]/15 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]' 
        : 'border-[#00ff41]/30 bg-[#00ff41]/5 text-gray-300 hover:bg-[#00ff41]/10 hover:border-[#00ff41]/50'
    }`}>
      {skill}
    </div>
  );
}