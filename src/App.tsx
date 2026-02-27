import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import Header from '@/sections/Header';
import HomePage from '@/pages/HomePage';
import MCPPage from '@/pages/MCPPage';
import SkillsPage from '@/pages/SkillsPage';
import ToolsPage from '@/pages/ToolsPage';
import LoginPage from '@/pages/LoginPage';
import SubmitPage from '@/pages/SubmitPage';
import PluginsPage from '@/pages/PluginsPage';
import './App.css';
import { 
  onAuthStateChanged, 
  getUserProfile, 
  updateFavorites,
  createUserProfile,
  type User 
} from '@/lib/firebase';

type Page = 'home' | 'mcp' | 'skills' | 'plugins' | 'tools' | 'login' | 'submit';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState({
    skills: [] as string[],
    mcpServers: [] as string[],
    tools: [] as string[],
    plugins: [] as string[],
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get or create user profile
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser);
          profile = await getUserProfile(firebaseUser.uid);
        }
        if (profile) {
          setFavorites(profile.favorites);
        }
      } else {
        setUser(null);
        setFavorites({ skills: [], mcpServers: [], tools: [], plugins: [] });
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePageChange = useCallback((page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setFavorites({ skills: [], mcpServers: [], tools: [], plugins: [] });
  }, []);

  const handleToggleFavorite = useCallback(async (type: 'skills' | 'mcpServers' | 'tools' | 'plugins', id: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      setCurrentPage('login');
      return;
    }

    const isFavorite = favorites[type].includes(id);
    const action = isFavorite ? 'remove' : 'add';

    // Optimistically update UI
    setFavorites(prev => ({
      ...prev,
      [type]: action === 'add' 
        ? [...prev[type], id]
        : prev[type].filter(itemId => itemId !== id)
    }));

    // Update in Firestore
    try {
      await updateFavorites(user.uid, type, id, action);
    } catch (err) {
      // Revert on error
      setFavorites(prev => ({
        ...prev,
        [type]: isFavorite 
          ? [...prev[type], id]
          : prev[type].filter(itemId => itemId !== id)
      }));
      console.error('Failed to update favorites:', err);
    }
  }, [user, favorites]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'mcp':
        return (
          <MCPPage 
            favorites={favorites.mcpServers}
            onToggleFavorite={(id) => handleToggleFavorite('mcpServers', id)}
          />
        );
      case 'skills':
        return (
          <SkillsPage 
            favorites={favorites.skills}
            onToggleFavorite={(id) => handleToggleFavorite('skills', id)}
          />
        );
      case 'tools':
        return (
          <ToolsPage
            favorites={favorites.tools}
            onToggleFavorite={(id) => handleToggleFavorite('tools', id)}
          />
        );
      case 'plugins':
        return (
          <PluginsPage
            favorites={favorites.plugins}
            onToggleFavorite={(id) => handleToggleFavorite('plugins', id)}
          />
        );
      case 'login':
        return <LoginPage onLogin={handleLogin} user={user} />;
      case 'submit':
        return <SubmitPage user={user} />;
      default:
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl">🐦‍⬛</span>
          <div className="w-8 h-8 border-2 border-crow-accent/30 border-t-crow-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        user={user}
        onLogout={handleLogout}
      />
      <main className="animate-fade-in">{renderPage()}</main>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐦‍⬛</span>
              <span className="font-mono font-bold text-sm">THE.CROW.CODE</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
              <button 
                onClick={() => handlePageChange('submit')}
                className="hover:text-foreground transition-colors"
              >
                Submit Skill
              </button>
              <a href="#privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a 
                href="https://github.com/QbitLoop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground font-mono">
            <p>
              Built with inspiration from{' '}
              <a 
                href="https://w.qbitloop.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-crow-accent hover:underline"
              >
                QbitLoop
              </a>
              {' '}and{' '}
              <a 
                href="https://github.com/QbitLoop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-crow-accent hover:underline"
              >
                @QbitLoop
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
