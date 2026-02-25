import { useState, useEffect } from 'react';
import { Send, Github, Tag, FileText, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { skillCategories } from '@/data/skills';
import { submitSkill } from '@/lib/firebase';
import type { User } from '@/lib/firebase';

interface SubmitPageProps {
  user?: User | null;
}

export default function SubmitPage({ user }: SubmitPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Development',
    githubUrl: '',
    tags: '',
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      setError('Please sign in to submit a skill');
      setIsLoading(false);
      return;
    }

    try {
      await submitSkill({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        author: user.displayName || user.email || 'Anonymous',
        githubUrl: formData.githubUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        submittedBy: user.uid,
        status: 'pending',
      });

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        category: 'Development',
        githubUrl: '',
        tags: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-crow-accent/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-crow-accent" />
          </div>
          <h1 className="font-mono text-2xl font-bold mb-2">Submit a Skill</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to submit a new skill to the directory.
          </p>
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))}
            className="bg-crow-accent hover:bg-crow-accent/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-crow-accent/10 mb-4">
            <Send className="w-8 h-8 text-crow-accent" />
          </div>
          <h1 className="font-mono text-2xl font-bold mb-2">Submit a Skill</h1>
          <p className="text-muted-foreground">
            Share your AI agent skill with the community
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30">
            <Check className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-600">
              Skill submitted successfully! We'll review it and add it to the directory.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`space-y-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Skill Name */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Skill Name
            </label>
            <Input
              name="name"
              placeholder="e.g., React Component Generator"
              value={formData.name}
              onChange={handleChange}
              className="font-mono"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Describe what your skill does and how it helps AI agents..."
              value={formData.description}
              onChange={handleChange}
              className="font-mono min-h-[120px]"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-crow-accent/20 focus:border-crow-accent"
              required
            >
              {skillCategories.filter(c => c !== 'All').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium flex items-center gap-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              GitHub URL
            </label>
            <Input
              name="githubUrl"
              type="url"
              placeholder="https://github.com/username/skill-repo"
              value={formData.githubUrl}
              onChange={handleChange}
              className="font-mono"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Tags
            </label>
            <Input
              name="tags"
              placeholder="react, typescript, components (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground font-mono">
              Separate tags with commas
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-crow-accent hover:bg-crow-accent/90 text-white font-mono py-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Skill
              </span>
            )}
          </Button>
        </form>

        {/* Guidelines */}
        <div
          className={`mt-8 p-4 bg-muted/50 border border-border rounded-lg transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="font-mono font-bold text-sm mb-3">Submission Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-crow-accent">•</span>
              Skills should be well-documented with clear instructions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crow-accent">•</span>
              Include examples of how the skill is used
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crow-accent">•</span>
              Test your skill with multiple AI agents before submitting
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crow-accent">•</span>
              All submissions are reviewed before being added to the directory
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
