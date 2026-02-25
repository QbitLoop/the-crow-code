import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Cpu, Terminal, Cloud, Code, Star, ExternalLink, Monitor, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tools, toolCategories, type Tool } from '@/data/tools';
import PlayingCardModal from '@/components/PlayingCardModal';
import { generateToolInstallCommand, detectPlatform } from '@/lib/cliTool';

const categoryIcons: Record<string, React.ElementType> = {
  'IDE': Monitor,
  'CLI': Terminal,
  'Agent Framework': Box,
  'Cloud Platform': Cloud,
  'Open Source': Code,
};

interface ToolsPageProps {
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export default function ToolsPage({ favorites = [], onToggleFavorite }: ToolsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCardClick = useCallback((tool: Tool) => {
    setSelectedTool(tool);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTool(null);
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
              <Cpu className="w-5 h-5 text-crow-accent" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold">
              AI Coding Tools
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Curated collection of the best AI coding tools, IDEs, CLI tools, and frameworks. 
            From agentic development environments to cloud platforms.
          </p>
        </div>

        {/* Search and Filter */}
        <div
          className={`flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {toolCategories.map((category) => (
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
          Showing {filteredTools.length} of {tools.length} tools
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              isVisible={isVisible}
              onClick={() => handleCardClick(tool)}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={() => onToggleFavorite?.(tool.id)}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-mono">
              No tools found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Playing Card Modal */}
      {selectedTool && (
        <PlayingCardModal
          isOpen={!!selectedTool}
          onClose={handleCloseModal}
          title={selectedTool.name}
          subtitle={selectedTool.category}
          description={selectedTool.description}
          details={selectedTool.features || []}
          meta={{
            author: selectedTool.category,
            category: selectedTool.category,
          }}
          tags={selectedTool.tags}
          website={selectedTool.website}
          isFavorite={favorites.includes(selectedTool.id)}
          onToggleFavorite={() => onToggleFavorite?.(selectedTool.id)}
          installCommand={generateToolInstallCommand(selectedTool.id, detectPlatform())}
          type="tool"
        />
      )}
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  isVisible: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function ToolCard({ tool, index, isVisible, onClick, isFavorite }: ToolCardProps) {
  const CategoryIcon = categoryIcons[tool.category] || Cpu;

  return (
    <div
      onClick={onClick}
      className={`group block bg-card border border-border rounded-xl p-5 card-hover transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${150 + index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-crow-accent/10 group-hover:text-crow-accent transition-colors">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm group-hover:text-crow-accent transition-colors">
              {tool.name}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {tool.category}
            </span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {tool.description}
      </p>

      {tool.features && (
        <div className="mb-4">
          <ul className="space-y-1">
            {tool.features.slice(0, 2).map((feature, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <span className="w-1 h-1 bg-crow-accent rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {tool.tags.slice(0, 3).map((tag) => (
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
        <Badge variant="secondary" className="text-xs font-mono">
          {tool.pricing}
        </Badge>
        {isFavorite && (
          <Star className="w-4 h-4 text-crow-accent fill-crow-accent" />
        )}
      </div>
    </div>
  );
}
