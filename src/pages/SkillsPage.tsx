import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, BookOpen, Wrench, FileText, Palette, MessageSquare, TestTube, GitBranch, FolderKanban, Code, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { skills, skillCategories, type Skill } from '@/data/skills';
import PlayingCardModal from '@/components/PlayingCardModal';
import { generateSkillInstallCommand } from '@/lib/cliTool';

const categoryIcons: Record<string, React.ElementType> = {
  'Development': Code,
  'Document Processing': FileText,
  'Design & Creative': Palette,
  'Communication': MessageSquare,
  'Testing': TestTube,
  'DevOps': GitBranch,
  'Project Management': FolderKanban,
};

interface SkillsPageProps {
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export default function SkillsPage({ favorites = [], onToggleFavorite }: SkillsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'All' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCardClick = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSkill(null);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-crow-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-crow-accent" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold">
              Agent Skills
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Reusable instructions that teach your AI agent how to perform tasks 
            in a repeatable way. Drop them in and your agent follows automatically.
          </p>
        </div>

        {/* Info Cards */}
        <div
          className={`grid sm:grid-cols-2 gap-4 mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-crow-accent" />
              <span className="font-mono font-bold text-sm">What are Skills?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Skills are specialized folders containing instructions, scripts, and resources 
              that Claude dynamically discovers and loads when relevant to tasks.
            </p>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-crow-accent" />
              <span className="font-mono font-bold text-sm">Installation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Install to <code className="bg-muted px-1 rounded font-mono text-xs">~/.claude/skills/</code> for global use 
              or <code className="bg-muted px-1 rounded font-mono text-xs">.claude/skills/</code> for project-specific skills.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div
          className={`flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {skillCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="font-mono text-xs whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground font-mono">
          Showing {filteredSkills.length} of {skills.length} skills
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={index}
              isVisible={isVisible}
              onClick={() => handleCardClick(skill)}
              isFavorite={favorites.includes(skill.id)}
              onToggleFavorite={() => onToggleFavorite?.(skill.id)}
            />
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-mono">
              No skills found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Playing Card Modal */}
      {selectedSkill && (
        <PlayingCardModal
          isOpen={!!selectedSkill}
          onClose={handleCloseModal}
          title={selectedSkill.name}
          description={selectedSkill.description}
          details={[
            `Category: ${selectedSkill.category}`,
            `Author: ${selectedSkill.author}`,
            `Tags: ${selectedSkill.tags.join(', ')}`,
          ]}
          meta={{
            author: selectedSkill.author,
            category: selectedSkill.category,
          }}
          tags={selectedSkill.tags}
          githubUrl={selectedSkill.githubUrl}
          isFavorite={favorites.includes(selectedSkill.id)}
          onToggleFavorite={() => onToggleFavorite?.(selectedSkill.id)}
          installCommand={selectedSkill.githubUrl ? 
            generateSkillInstallCommand(selectedSkill.name, selectedSkill.githubUrl) : 
            undefined
          }
          type="skill"
        />
      )}
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  index: number;
  isVisible: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function SkillCard({ skill, index, isVisible, onClick, isFavorite }: SkillCardProps) {
  const CategoryIcon = categoryIcons[skill.category] || Code;

  return (
    <div
      onClick={onClick}
      className={`group bg-card border border-border rounded-xl p-5 card-hover transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${250 + index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <CategoryIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-mono font-bold text-sm group-hover:text-crow-accent transition-colors line-clamp-1">
            {skill.name}
          </h3>
        </div>
        {skill.githubUrl && (
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-crow-accent transition-colors"
          >
            <Code className="w-4 h-4" />
          </a>
        )}
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {skill.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {skill.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs font-mono"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          by {skill.author}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-mono">
            {skill.category}
          </Badge>
          {isFavorite && (
            <Star className="w-4 h-4 text-crow-accent fill-crow-accent" />
          )}
        </div>
      </div>
    </div>
  );
}
