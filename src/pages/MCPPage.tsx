import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ExternalLink, Star, Download, Filter, Terminal, Server, Database, Shield, Activity, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mcpServers, mcpCategories, type MCPServer } from '@/data/mcpServers';
import PlayingCardModal from '@/components/PlayingCardModal';
import { formatStars } from '@/lib/githubApi';
import { generateMCPInstallCommand } from '@/lib/cliTool';

const categoryIcons: Record<string, React.ElementType> = {
  'Cloud Platforms': Server,
  'Databases': Database,
  'Developer Tools': Code,
  'Knowledge & Memory': Terminal,
  'Monitoring': Activity,
  'Security': Shield,
  'Other': Terminal,
};

interface MCPPageProps {
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export default function MCPPage({ favorites = [], onToggleFavorite }: MCPPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredServers = useMemo(() => {
    return mcpServers.filter((server) => {
      const matchesSearch =
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || server.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCardClick = useCallback((server: MCPServer) => {
    setSelectedServer(server);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedServer(null);
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
              <Server className="w-5 h-5 text-crow-accent" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold">
              MCP Servers
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Model Context Protocol servers that extend your AI agent's capabilities. 
            Curated from the best open-source repositories.
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
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {mcpCategories.map((category) => (
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
          Showing {filteredServers.length} of {mcpServers.length} servers
        </div>

        {/* Servers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server, index) => (
            <MCPServerCard
              key={server.id}
              server={server}
              index={index}
              isVisible={isVisible}
              onClick={() => handleCardClick(server)}
              isFavorite={favorites.includes(server.id)}
              onToggleFavorite={() => onToggleFavorite?.(server.id)}
            />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-mono">
              No MCP servers found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Playing Card Modal */}
      {selectedServer && (
        <PlayingCardModal
          isOpen={!!selectedServer}
          onClose={handleCloseModal}
          title={selectedServer.name}
          description={selectedServer.description}
          details={[
            `Category: ${selectedServer.category}`,
            `Author: ${selectedServer.author}`,
            `License: ${selectedServer.license}`,
          ]}
          meta={{
            stars: selectedServer.stars,
            author: selectedServer.author,
            category: selectedServer.category,
            license: selectedServer.license,
          }}
          tags={selectedServer.category ? [selectedServer.category] : []}
          githubUrl={selectedServer.githubUrl}
          isFavorite={favorites.includes(selectedServer.id)}
          onToggleFavorite={() => onToggleFavorite?.(selectedServer.id)}
          installCommand={generateMCPInstallCommand(selectedServer.name, 'npm')}
          type="mcp"
        />
      )}
    </div>
  );
}

interface MCPServerCardProps {
  server: MCPServer;
  index: number;
  isVisible: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function MCPServerCard({ server, index, isVisible, onClick, isFavorite, onToggleFavorite }: MCPServerCardProps) {
  const CategoryIcon = categoryIcons[server.category] || Server;

  return (
    <div
      onClick={onClick}
      className={`group block bg-card border border-border rounded-xl p-5 card-hover transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${150 + index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <CategoryIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-mono font-bold text-sm group-hover:text-crow-accent transition-colors line-clamp-1">
            {server.name}
          </h3>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {server.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span className="font-mono">{formatStars(server.stars)}</span>
          </div>
          {server.installs && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span className="font-mono">{server.installs}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-mono">
            {server.license}
          </Badge>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          by {server.author}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${isFavorite ? 'text-crow-accent fill-crow-accent' : 'text-muted-foreground'}`} 
          />
        </button>
      </div>
    </div>
  );
}
