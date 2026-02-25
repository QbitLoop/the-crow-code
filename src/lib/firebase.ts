import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: Array<{ providerId: string }>;
}

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

function toUser(fb: FirebaseUser): User {
  return {
    uid: fb.uid,
    email: fb.email,
    displayName: fb.displayName,
    photoURL: fb.photoURL,
    emailVerified: fb.emailVerified,
    providerData: fb.providerData.map(p => ({ providerId: p.providerId })),
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const signInWithGoogle = async (): Promise<{ user: User }> => {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return { user: toUser(user) };
};

export const signInWithGithub = async (): Promise<{ user: User }> => {
  const provider = new GithubAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return { user: toUser(user) };
};

export const signInWithApple = async (): Promise<{ user: User }> => {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const { user } = await signInWithPopup(auth, provider);
  return { user: toUser(user) };
};

export const logOut = (): Promise<void> => signOut(auth);

export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  return firebaseOnAuthStateChanged(auth, fb => callback(fb ? toUser(fb) : null));
};

// ── Firestore ─────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function createUserProfile(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    favorites: { skills: [], mcpServers: [], tools: [] },
    createdAt: serverTimestamp(),
  });
}

export async function updateFavorites(
  uid: string,
  type: 'skills' | 'mcpServers' | 'tools',
  itemId: string,
  action: 'add' | 'remove',
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    [`favorites.${type}`]: action === 'add' ? arrayUnion(itemId) : arrayRemove(itemId),
  });
}

export async function submitSkill(
  submission: Omit<SkillSubmission, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'submissions'), {
    ...submission,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserSubmissions(uid: string): Promise<SkillSubmission[]> {
  const q = query(collection(db, 'submissions'), where('submittedBy', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as SkillSubmission[];
}
