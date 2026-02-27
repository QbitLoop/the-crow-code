import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Code,
  Zap,
  Shield,
  Bot,
  FileCode,
  Brain,
  FileText,
  FlaskConical,
  Wrench,
  GitBranch,
  Star,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plugins, pluginCategories, type Plugin } from '@/data/plugins';
import PlayingCardModal from '@/components/PlayingCardModal';

const categoryIcons: Record<string, React.ElementType> = {
  Development: Code,
  Productivity: Zap,
  Security: Shield,
  Automation: Bot,
  Languages: FileCode,
  'AI / ML': Brain,
  Testing: FlaskConical,
  Utilities: Wrench,
  Workflow: GitBranch,
};

interface PluginsPageProps {
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

function CopyButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copy install command"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function PluginsPage({ favorites = [], onToggleFavorite }: PluginsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'official' | 'community'>('all');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      const matchesSearch =
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' || plugin.category === selectedCategory;
      const matchesSource =
        sourceFilter === 'all' || plugin.source === sourceFilter;
      return matchesSearch && matchesCategory && matchesSource;
    });
  }, [searchQuery, selectedCategory, sourceFilter]);

  const handleCardClick = useCallback((plugin: Plugin) => {
    setSelectedPlugin(plugin);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPlugin(null);
  }, []);

  const officialCount = plugins.filter((p) => p.source === 'official').length;
  const communityCount = plugins.filter((p) => p.source === 'community').length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-crow-accent/10 border border-crow-accent/20 rounded-full mb-4">
            <Terminal className="w-3.5 h-3.5 text-crow-accent" />
            <span className="font-mono text-xs text-crow-accent">
              npx claude-plugins install
            </span>
          </div>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-3">
            Claude Code Plugins
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Extend Claude Code with official and community plugins — skills, agents, hooks, MCP servers, and commands bundled into one install.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm font-mono text-muted-foreground">
            <span>
              <span className="text-crow-accent font-bold">{officialCount}</span> Official
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="text-crow-accent font-bold">{communityCount}</span> Community
            </span>
          </div>
        </div>

        {/* Search + Filters */}
        <div
          className={`mb-8 space-y-4 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-mono text-sm"
            />
          </div>

          {/* Source filter */}
          <div className="flex justify-center gap-2">
            {(['all', 'official', 'community'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-4 py-1.5 rounded-full font-mono text-xs transition-colors border ${
                  sourceFilter === s
                    ? 'bg-crow-accent text-white border-crow-accent'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {pluginCategories.map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-xs font-mono text-muted-foreground">
          {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''}
        </div>

        {/* Plugin grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((plugin, i) => {
            const isFav = favorites.includes(plugin.id);
            return (
              <div
                key={plugin.id}
                onClick={() => handleCardClick(plugin)}
                className={`group relative bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-crow-accent/40 hover:shadow-md transition-all duration-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                {/* Source badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                      plugin.source === 'official'
                        ? 'border-crow-accent/40 text-crow-accent bg-crow-accent/5'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {plugin.source === 'official' ? '✦ official' : 'community'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(plugin.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav
                        ? 'text-crow-accent'
                        : 'text-muted-foreground hover:text-crow-accent'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Name */}
                <h3 className="font-mono font-bold text-sm mb-1 group-hover:text-crow-accent transition-colors">
                  {plugin.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  {plugin.author}
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {plugin.description}
                </p>

                {/* Install command */}
                {plugin.installCommand && (
                  <div
                    className="flex items-center gap-1 bg-muted/60 rounded-lg px-3 py-2 mb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <code className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {plugin.installCommand}
                    </code>
                    <CopyButton command={plugin.installCommand} />
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {plugin.category}
                  </Badge>
                  {plugin.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="font-mono text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="text-center py-16 text-muted-foreground font-mono">
            <Terminal className="w-8 h-8 mx-auto mb-4 opacity-40" />
            <p>No plugins found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPlugin && (
        <PlayingCardModal
          isOpen={!!selectedPlugin}
          onClose={handleCloseModal}
          title={selectedPlugin.name}
          subtitle={selectedPlugin.author}
          description={selectedPlugin.description}
          details={selectedPlugin.components ? [selectedPlugin.components] : []}
          meta={{
            author: selectedPlugin.author,
            category: selectedPlugin.category,
          }}
          tags={selectedPlugin.tags}
          githubUrl={selectedPlugin.githubUrl}
          isFavorite={favorites.includes(selectedPlugin.id)}
          onToggleFavorite={() => onToggleFavorite?.(selectedPlugin.id)}
          installCommand={selectedPlugin.installCommand}
          type="plugin"
        />
      )}
    </div>
  );
}
