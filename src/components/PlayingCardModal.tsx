import { useEffect, useRef } from 'react';
import { X, Star, GitFork, Calendar, Code, Tag, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatStars } from '@/lib/githubApi';

interface PlayingCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description: string;
  details?: string[];
  meta: {
    stars?: number;
    forks?: number;
    language?: string | null;
    updatedAt?: string;
    license?: string;
    author: string;
    category: string;
  };
  tags: string[];
  githubUrl?: string;
  website?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  installCommand?: string;
  type: 'mcp' | 'skill' | 'tool';
}

export default function PlayingCardModal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  details = [],
  meta,
  tags,
  githubUrl,
  website,
  isFavorite = false,
  onToggleFavorite,
  installCommand,
  type
}: PlayingCardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'mcp':
        return <span className="text-crow-accent font-mono text-xs">MCP</span>;
      case 'skill':
        return <span className="text-crow-accent font-mono text-xs">SKILL</span>;
      case 'tool':
        return <span className="text-crow-accent font-mono text-xs">TOOL</span>;
    }
  };

  const getSuitSymbol = () => {
    switch (type) {
      case 'mcp':
        return '♠'; // Spade for MCP
      case 'skill':
        return '♥'; // Heart for Skills
      case 'tool':
        return '♦'; // Diamond for Tools
      default:
        return '♣';
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      {/* Playing Card Container */}
      <div 
        className="relative w-full max-w-lg animate-scale-in"
        style={{ 
          perspective: '1000px',
          animation: 'cardFlip 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Card */}
        <div 
          className="relative bg-card border-2 border-border rounded-2xl overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '2.5/3.5',
            maxHeight: '80vh'
          }}
        >
          {/* Card Pattern Background */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  hsl(var(--foreground)) 10px,
                  hsl(var(--foreground)) 11px
                )`
              }}
            />
          </div>

          {/* Card Content */}
          <div className="relative h-full flex flex-col p-6">
            {/* Top Corner - Rank & Suit */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className="font-mono text-2xl font-bold text-crow-accent">A</span>
                <span className="text-crow-accent text-xl">{getSuitSymbol()}</span>
              </div>
              
              {/* Type Badge */}
              <div className="px-3 py-1 bg-crow-accent/10 border border-crow-accent/30 rounded-full">
                {getTypeIcon()}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Title Section */}
              <div className="text-center py-4">
                <h2 className="font-mono text-xl font-bold mb-1">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground font-mono">{subtitle}</p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-crow-accent">{getSuitSymbol()}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>

                {/* Details List */}
                {details.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Details
                    </h3>
                    <ul className="space-y-1">
                      {details.map((detail, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-crow-accent mt-1">{getSuitSymbol()}</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meta Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {meta.stars !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{formatStars(meta.stars)}</span>
                    </div>
                  )}
                  {meta.forks !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <GitFork className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{formatStars(meta.forks)}</span>
                    </div>
                  )}
                  {meta.language && (
                    <div className="flex items-center gap-2 text-sm">
                      <Code className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{meta.language}</span>
                    </div>
                  )}
                  {meta.updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-xs">
                        {new Date(meta.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <Tag className="w-4 h-4 text-muted-foreground mr-1" />
                    {tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs font-mono">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Install Command */}
                {installCommand && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground font-mono mb-1">Install</p>
                    <code className="text-sm font-mono text-crow-accent">{installCommand}</code>
                  </div>
                )}
              </div>

              {/* Bottom Corner - Rank & Suit (inverted) */}
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {/* Favorite Button */}
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleFavorite}
                      className="gap-2"
                    >
                      {isFavorite ? (
                        <BookmarkCheck className="w-4 h-4 text-crow-accent" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      <span className="font-mono text-xs">
                        {isFavorite ? 'Saved' : 'Save'}
                      </span>
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <span className="font-mono text-xs">GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="gap-2 bg-crow-accent hover:bg-crow-accent/90">
                        <span className="font-mono text-xs">Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>

                {/* Inverted Corner */}
                <div className="flex flex-col items-center rotate-180">
                  <span className="font-mono text-2xl font-bold text-crow-accent">A</span>
                  <span className="text-crow-accent text-xl">{getSuitSymbol()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardFlip {
          from {
            opacity: 0;
            transform: rotateY(-90deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: rotateY(0) scale(1);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
