import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { StudentProfile } from '../types';

export function getDeterministicStudentId(email: string): string {
  const clean = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return `student-${Math.abs(hash)}`;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: StudentProfile | null;
  loading: boolean;
  authError: string | null;
  isGuestReviewer: boolean;
  registerStudent: (
    email: string,
    pass: string,
    displayName: string,
    college: string
  ) => Promise<void>;
  loginStudent: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutStudent: () => Promise<void>;
  loginAsGuestReviewer: (roleName?: string, customEmail?: string) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'findit_student_session_v2';
const REGISTERED_USERS_STORE = 'findit_registered_students_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuestReviewer, setIsGuestReviewer] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved)?.isGuest === true : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuestReviewer(false);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as StudentProfile;
            setUserProfile(data);
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data));
          } else {
            const fallback: StudentProfile = {
              id: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Campus Student',
              email: user.email || '',
              college: 'Poona College of Arts, Science & Commerce',
            };
            setUserProfile(fallback);
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallback));
          }
        } catch (err) {
          console.warn('Could not fetch user profile doc:', err);
          const fallback: StudentProfile = {
            id: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Campus Student',
            email: user.email || '',
            college: 'Poona College of Arts, Science & Commerce',
          };
          setUserProfile(fallback);
        }
      } else {
        try {
          const saved = localStorage.getItem(LOCAL_SESSION_KEY);
          if (saved) {
            const data = JSON.parse(saved);
            setUserProfile(data);
            setIsGuestReviewer(Boolean(data.isGuest));
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not yet enabled in Firebase Console. You can use Google Sign-In or quick Student Login.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this student email already exists. Please switch to the "Student Sign In" tab.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid student email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/user-not-found') {
      return 'No account found with this email. Please switch to "Register Student" to create one.';
    }
    if (code === 'auth/wrong-password') {
      return 'Incorrect password. Please verify and try again.';
    }
    if (code === 'auth/invalid-credential') {
      return 'Invalid credentials. If you haven’t created an account yet, switch to "Register Student".';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed. Please try again.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Access temporarily paused due to repeated attempts. Please try again shortly.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection issue. Please check your internet connectivity.';
    }
    return err?.message || 'Authentication error. Please check your credentials.';
  };

  const registerStudent = async (
    email: string,
    pass: string,
    displayName: string,
    college: string
  ) => {
    setAuthError(null);
    const cleanEmail = email.toLowerCase().trim();
    const studentId = getDeterministicStudentId(cleanEmail);

    const profile: StudentProfile = {
      id: studentId,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      college: college.trim() || 'Poona College of Arts, Science & Commerce',
      createdAt: new Date().toISOString(),
    };

    // Save student profile to registered students registry in localStorage
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_STORE);
      const registry = stored ? JSON.parse(stored) : {};
      registry[cleanEmail] = { ...profile, password: pass };
      localStorage.setItem(REGISTERED_USERS_STORE, JSON.stringify(registry));
    } catch (e) {
      console.warn('Student registry store notice:', e);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(cred.user, {
        displayName: displayName.trim(),
      });
      profile.id = cred.user.uid;

      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (dbErr) {
        console.warn('Profile doc creation note:', dbErr);
      }

      setUserProfile(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
        setUserProfile(profile);
        setIsGuestReviewer(false);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        return;
      }

      const message = mapAuthError(err);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginStudent = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.toLowerCase().trim();
    const studentId = getDeterministicStudentId(cleanEmail);

    // Check local registry first for student's profile details
    let existingProfile: StudentProfile | null = null;
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_STORE);
      if (stored) {
        const registry = JSON.parse(stored);
        if (registry[cleanEmail]) {
          existingProfile = registry[cleanEmail];
        }
      }
    } catch {}

    const defaultProfile: StudentProfile = existingProfile || {
      id: studentId,
      displayName: cleanEmail.split('@')[0],
      email: cleanEmail,
      college: 'Poona College of Arts, Science & Commerce',
    };

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const activeId = cred.user.uid;
      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as StudentProfile;
          setUserProfile(profile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        } else {
          const profile: StudentProfile = {
            id: activeId,
            displayName: cred.user.displayName || defaultProfile.displayName,
            email: cred.user.email || cleanEmail,
            college: 'Poona College of Arts, Science & Commerce',
          };
          setUserProfile(profile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        }
      } catch {
        setUserProfile(defaultProfile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultProfile));
      }
    } catch (err: any) {
      // If email/password is not enabled in Firebase Console, recover gracefully with the deterministic profile
      if (err?.code === 'auth/operation-not-allowed') {
        setUserProfile(defaultProfile);
        setIsGuestReviewer(false);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultProfile));
        return;
      }

      const message = mapAuthError(err);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      const profile: StudentProfile = {
        id: user.uid,
        displayName: user.displayName || 'Campus Student',
        email: user.email?.toLowerCase().trim() || '',
        college: 'Poona College of Arts, Science & Commerce',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      } catch (dbErr) {
        console.warn('Google profile sync note:', dbErr);
      }

      setUserProfile(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        const message = mapAuthError(err);
        setAuthError(message);
        throw new Error(message);
      }
    }
  };

  const logoutStudent = async () => {
    setAuthError(null);
    setIsGuestReviewer(false);
    setUserProfile(null);
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  const loginAsGuestReviewer = (roleName = 'Hackathon Judge', customEmail?: string) => {
    setIsGuestReviewer(true);
    const assignedEmail = (customEmail || (roleName.includes('Judge') ? 'judge.codecraft@poonacollege.edu.in' : 'student.farhan@poonacollege.edu.in')).toLowerCase().trim();
    const profile: StudentProfile & { isGuest: boolean } = {
      id: getDeterministicStudentId(assignedEmail),
      displayName: roleName,
      email: assignedEmail,
      college: 'Poona College of Arts, Science & Commerce',
      isGuest: true,
    };
    setUserProfile(profile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        isGuestReviewer,
        registerStudent,
        loginStudent,
        loginWithGoogle,
        logoutStudent,
        loginAsGuestReviewer,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
