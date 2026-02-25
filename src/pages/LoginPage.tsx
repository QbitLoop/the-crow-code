import { useState, useEffect } from 'react';
import { Github, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  signInWithGoogle,
  signInWithGithub,
  signInWithApple,
  logOut,
  createUserProfile,
  type User,
} from '@/lib/firebase';

interface LoginPageProps {
  onLogin?: (user: User) => void;
  user?: User | null;
}

export default function LoginPage({ onLogin, user }: LoginPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<'google' | 'github' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setIsVisible(true); }, []);

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    setIsLoading(provider);
    setError(null);
    try {
      let result;
      if (provider === 'google')      result = await signInWithGoogle();
      else if (provider === 'github') result = await signInWithGithub();
      else                            result = await signInWithApple();

      if (result.user) {
        await createUserProfile(result.user);
        onLogin?.(result.user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setError(msg);
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = async () => {
    try { await logOut(); window.location.reload(); }
    catch (err) { console.error('Logout error:', err); }
  };

  // ── Logged-in profile view ───────────────────────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-crow-accent/10 mb-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full" />
              ) : (
                <span className="text-3xl font-mono font-bold text-crow-accent">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <h1 className="font-mono text-2xl font-bold mb-2">{user.displayName || 'Welcome'}</h1>
            <p className="text-muted-foreground text-sm font-mono">{user.email}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-mono font-bold mb-4">Account</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs">{user.uid.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="font-mono text-xs capitalize">
                    {user.providerData[0]?.providerId.split('.')[0]}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <span className="font-mono text-xs">{user.emailVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full font-mono gap-2">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login view ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">

        <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-crow-accent/10 mb-4">
            <span className="text-3xl">🐦‍⬛</span>
          </div>
          <h1 className="font-mono text-2xl font-bold mb-2">Welcome to THE.CROW.CODE</h1>
          <p className="text-muted-foreground text-sm">Sign in to save your favorite skills and MCP servers</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={`space-y-3 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* GitHub */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 font-mono"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading !== null}
          >
            {isLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Continue with GitHub
          </Button>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 font-mono"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading !== null}
          >
            {isLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Apple */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 font-mono"
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading !== null}
          >
            {isLoading === 'apple' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zm-5.85-15.1c.07-2.04 1.76-3.79 3.78-3.94.29 2.32-1.93 4.48-3.78 3.94z"/>
              </svg>
            )}
            Continue with Apple
          </Button>

        </div>

        <div className={`mt-8 p-4 bg-muted/50 border border-border rounded-lg transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-muted-foreground font-mono text-center">
            By signing in, you agree to our{' '}
            <a href="#terms" className="text-crow-accent hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#privacy" className="text-crow-accent hover:underline">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  );
}
