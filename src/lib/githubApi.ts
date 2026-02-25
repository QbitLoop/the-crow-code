import type { MCPServer } from '@/data/mcpServers';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';

// Cache for GitHub data
interface GitHubCache {
  [key: string]: {
    data: GitHubRepoData;
    timestamp: number;
  };
}

interface GitHubRepoData {
  stars: number;
  forks: number;
  description: string;
  updatedAt: string;
  openIssues: number;
  language: string | null;
  topics: string[];
}

const cache: GitHubCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Extract owner and repo from GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  return null;
}

// Fetch repo data from GitHub API
export async function fetchRepoData(url: string): Promise<GitHubRepoData | null> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) return null;

  const cacheKey = `${parsed.owner}/${parsed.repo}`;
  const cached = cache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(import.meta.env.VITE_GITHUB_TOKEN && {
            'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`
          })
        }
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('GitHub API rate limit exceeded');
      }
      return null;
    }

    const data = await response.json();
    const repoData: GitHubRepoData = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      description: data.description,
      updatedAt: data.updated_at,
      openIssues: data.open_issues_count,
      language: data.language,
      topics: data.topics || []
    };

    cache[cacheKey] = {
      data: repoData,
      timestamp: Date.now()
    };

    return repoData;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}

// Batch fetch multiple repos
export async function fetchMultipleRepos(urls: string[]): Promise<Map<string, GitHubRepoData>> {
  const results = new Map<string, GitHubRepoData>();
  
  // Use Promise.allSettled to handle failures gracefully
  const promises = urls.map(async (url) => {
    const data = await fetchRepoData(url);
    if (data) {
      results.set(url, data);
    }
  });

  await Promise.allSettled(promises);
  return results;
}

// Update MCP servers with live data
export async function updateMCPServersWithLiveData(servers: MCPServer[]): Promise<MCPServer[]> {
  const urls = servers.map(s => s.githubUrl);
  const liveData = await fetchMultipleRepos(urls);

  return servers.map(server => {
    const live = liveData.get(server.githubUrl);
    if (live) {
      return {
        ...server,
        stars: live.stars,
        description: live.description || server.description
      };
    }
    return server;
  });
}

// Search GitHub repositories
export async function searchGitHubRepos(
  query: string,
  sort: 'stars' | 'updated' | 'forks' = 'stars',
  perPage: number = 10
): Promise<Array<{ name: string; url: string; stars: number; description: string }>> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&per_page=${perPage}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(import.meta.env.VITE_GITHUB_TOKEN && {
            'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`
          })
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.items.map((item: any) => ({
      name: item.full_name,
      url: item.html_url,
      stars: item.stargazers_count,
      description: item.description || ''
    }));
  } catch (error) {
    console.error('Error searching GitHub:', error);
    return [];
  }
}

// Format star count
export function formatStars(stars: number): string {
  if (stars >= 1000000) {
    return `${(stars / 1000000).toFixed(1)}M`;
  }
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

// Get trending MCP-related repositories
export async function getTrendingMCPRepos(): Promise<Array<{ name: string; url: string; stars: number; description: string }>> {
  return searchGitHubRepos('mcp server model context protocol', 'stars', 20);
}
