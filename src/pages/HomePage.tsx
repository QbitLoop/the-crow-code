import { useState, useEffect } from 'react';
import { Terminal, Copy, Check, ArrowRight, Sparkles, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const agentTags = [
  'Claude Code',
  'Cursor',
  'Cline',
  'Windsurf',
  'Zed',
  'Amp',
  'Codex CLI',
  'Roo Code',
  'VS Code',
  'Gemini CLI',
];

const features = [
  {
    icon: Sparkles,
    title: 'Agent Skills',
    description: 'Reusable instructions that teach your AI agent how to perform tasks in a repeatable way.',
    action: 'Browse Skills',
    page: 'skills',
  },
  {
    icon: Zap,
    title: 'MCP Servers',
    description: 'Model Context Protocol servers that extend your agent\'s capabilities with external tools.',
    action: 'Browse MCP',
    page: 'mcp',
  },
  {
    icon: Layers,
    title: 'AI Tools',
    description: 'Curated collection of the best AI coding tools, IDEs, and frameworks for developers.',
    action: 'Browse Tools',
    page: 'tools',
  },
];

export default function HomePage({ onPageChange }: HomePageProps) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx the-crow-code find skill');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 items-center min-h-[60vh]">
            {/* Left Content */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crow-accent/10 border border-crow-accent/20 text-crow-accent text-xs font-mono transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Now with MCP Support</span>
                </div>
                <h1
                  className={`font-mono text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight transition-all duration-700 delay-100 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  Give your agents{' '}
                  <span className="gradient-text">context</span> to make them smarter
                </h1>
                <p
                  className={`text-lg sm:text-xl text-muted-foreground font-sans transition-all duration-700 delay-200 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  Find agent skills, MCP servers, and tools for Claude Code, Cursor, and more.
                </p>
              </div>

              {/* Command Input */}
              <div
                className={`transition-all duration-700 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="relative flex items-center bg-muted/50 border border-border rounded-lg px-4 py-4 hover:border-crow-accent/30 transition-colors group">
                  <Terminal className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <code className="flex-1 font-mono text-sm sm:text-base">
                    <span className="text-crow-accent">$</span> npx the-crow-code find skill
                    <span className="animate-blink ml-0.5 inline-block w-2 h-5 bg-crow-accent align-middle" />
                  </code>
                  <button
                    onClick={handleCopy}
                    className="ml-3 p-2 text-muted-foreground hover:text-crow-accent transition-colors rounded-md hover:bg-muted"
                    aria-label="Copy command"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-400 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <Button
                  onClick={() => onPageChange('skills')}
                  className="bg-crow-accent hover:bg-crow-accent/90 text-white font-mono px-8 py-6 text-sm rounded-lg transition-all hover:shadow-glow"
                >
                  Browse skills
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => onPageChange('mcp')}
                  variant="outline"
                  className="border-border hover:border-crow-accent/50 font-mono px-8 py-6 text-sm rounded-lg transition-all"
                >
                  Browse MCP servers
                </Button>
              </div>
            </div>

            {/* Right Content - Agent Tags */}
            <div className="lg:col-span-2">
              <div
                className={`transition-all duration-700 delay-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                  Works with these agents
                </p>
                <div className="flex flex-wrap gap-2">
                  {agentTags.map((tag, index) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 bg-muted border border-border rounded-md text-sm font-mono text-muted-foreground hover:text-foreground hover:border-crow-accent/30 transition-all cursor-default"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-mono text-muted-foreground">
                    + any MCP client
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-border" />
      </div>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold mb-3">
              What's in the directory
            </h2>
            <p className="text-muted-foreground">
              Everything AI agents need to be useful, curated and ready to use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-card border border-border rounded-xl p-6 lg:p-8 card-hover cursor-pointer"
                  onClick={() => onPageChange(feature.page)}
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-crow-accent/10 flex items-center justify-center group-hover:bg-crow-accent/20 transition-colors">
                      <Icon className="w-6 h-6 text-crow-accent" />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground mb-2 block">
                    0{index + 1}
                  </span>
                  <h3 className="font-mono text-lg font-bold mb-3 group-hover:text-crow-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm font-mono text-crow-accent">
                    {feature.action}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-border pt-16 text-center">
            <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Give your agent better{' '}
              <span className="gradient-text">skills</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Get better code - no hallucinations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => onPageChange('skills')}
                className="bg-crow-accent hover:bg-crow-accent/90 text-white font-mono px-8 py-6 text-sm rounded-lg"
              >
                Browse skills
              </Button>
              <Button
                onClick={() => onPageChange('mcp')}
                variant="outline"
                className="border-border hover:border-crow-accent/50 font-mono px-8 py-6 text-sm rounded-lg"
              >
                Browse MCP servers
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
