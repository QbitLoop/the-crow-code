import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Github, Twitter, User, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User as FirebaseUser } from '@/lib/firebase';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user?: FirebaseUser | null;
  onLogout?: () => void;
}

const navLinks = [
  { label: 'Home', value: 'home' },
  { label: 'MCP', value: 'mcp' },
  { label: 'Skills', value: 'skills' },
  { label: 'Tools', value: 'tools' },
  { label: 'Submit', value: 'submit' },
];

export default function Header({ currentPage, onPageChange, user, onLogout }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (value: string) => {
    onPageChange(value);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group"
          >
            <img src="/Crow.png" alt="Crow" className="w-8 h-8 object-contain" />
            <span className="font-mono font-bold text-sm tracking-wider group-hover:text-crow-accent transition-colors">
              THE.CROW.CODE
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.value}
                onClick={() => handleNavClick(link.value)}
                className={`relative px-4 py-2 text-sm font-mono transition-colors duration-300 group ${
                  currentPage === link.value
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {currentPage === link.value && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-crow-accent rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Social Links - Desktop */}
            <div className="hidden sm:flex items-center gap-1">
              <a
                href="https://github.com/QbitLoop"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-crow-accent/10 text-crow-accent text-xs">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={onLogout}
                  className="p-2 text-muted-foreground hover:text-crow-accent transition-colors rounded-lg hover:bg-muted"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => handleNavClick('login')}
                variant={currentPage === 'login' ? 'default' : 'outline'}
                size="sm"
                className="font-mono text-xs ml-2 gap-2"
              >
                <User className="w-3 h-3" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.value}
              onClick={() => handleNavClick(link.value)}
              className={`w-full text-left px-4 py-3 text-sm font-mono rounded-lg transition-colors ${
                currentPage === link.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-crow-accent/10 text-crow-accent text-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-sm">{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-muted-foreground hover:text-crow-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full text-left px-4 py-3 text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
