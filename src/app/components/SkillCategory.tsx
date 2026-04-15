import { SkillTag } from "./SkillTag";

interface SkillCategoryProps {
  category: string;
  skills: { name: string; highlight?: boolean }[];
}

export function SkillCategory({ category, skills }: SkillCategoryProps) {
  return (
    <div>
      <h3 className="font-mono text-sm text-[#00ff41]/60 mb-3 uppercase tracking-wider">
        {category}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill, index) => (
          <SkillTag key={index} skill={skill.name} highlight={skill.highlight} />
        ))}
      </div>
    </div>
  );
}
