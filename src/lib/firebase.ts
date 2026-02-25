// Mock Firebase implementation for development
// Replace with actual Firebase imports when ready

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: Array<{ providerId: string }>;
}

// Mock current user - null means not logged in
let currentUser: User | null = null;

// Mock auth functions
export const signInWithGoogle = async (): Promise<{ user: User }> => {
  const user: User = {
    uid: 'mock-google-uid',
    email: 'user@gmail.com',
    displayName: 'Google User',
    photoURL: null,
    emailVerified: true,
    providerData: [{ providerId: 'google.com' }],
  };
  currentUser = user;
  return { user };
};

export const signInWithGithub = async (): Promise<{ user: User }> => {
  const user: User = {
    uid: 'mock-github-uid',
    email: 'user@github.com',
    displayName: 'GitHub User',
    photoURL: null,
    emailVerified: true,
    providerData: [{ providerId: 'github.com' }],
  };
  currentUser = user;
  return { user };
};

export const signInWithApple = async (): Promise<{ user: User }> => {
  const user: User = {
    uid: 'mock-apple-uid',
    email: 'user@icloud.com',
    displayName: 'Apple User',
    photoURL: null,
    emailVerified: true,
    providerData: [{ providerId: 'apple.com' }],
  };
  currentUser = user;
  return { user };
};

export const logOut = async (): Promise<void> => {
  currentUser = null;
};

// Fixed onAuthStateChanged - calls callback immediately with current state
export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  // Call immediately with current state
  setTimeout(() => {
    callback(currentUser);
  }, 100);
  
  // Return unsubscribe function
  return () => {};
};

// Firestore types
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favorites: {
    skills: string[];
    mcpServers: string[];
    tools: string[];
  };
  createdAt: Date;
}

export interface SkillSubmission {
  id?: string;
  name: string;
  description: string;
  category: string;
  author: string;
  githubUrl: string;
  tags: string[];
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Mock Firestore functions
const mockUsers: Map<string, UserProfile> = new Map();
const mockSubmissions: Map<string, SkillSubmission> = new Map();

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return mockUsers.get(uid) || null;
}

export async function createUserProfile(user: User): Promise<void> {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    favorites: {
      skills: [],
      mcpServers: [],
      tools: []
    },
    createdAt: new Date()
  };
  mockUsers.set(user.uid, profile);
}

export async function updateFavorites(
  uid: string, 
  type: 'skills' | 'mcpServers' | 'tools', 
  itemId: string, 
  action: 'add' | 'remove'
): Promise<void> {
  const profile = mockUsers.get(uid);
  if (!profile) return;

  const favorites = profile.favorites[type];
  profile.favorites[type] = action === 'add' 
    ? [...favorites, itemId]
    : favorites.filter(id => id !== itemId);
}

export async function submitSkill(submission: Omit<SkillSubmission, 'id' | 'createdAt'>): Promise<string> {
  const id = `submission-${Date.now()}`;
  mockSubmissions.set(id, {
    ...submission,
    id,
    createdAt: new Date()
  });
  return id;
}

export async function getUserSubmissions(uid: string): Promise<SkillSubmission[]> {
  return Array.from(mockSubmissions.values()).filter(s => s.submittedBy === uid);
}
