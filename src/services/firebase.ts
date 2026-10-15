import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, TravelerPersona } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
(async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    }
  }
})();

/**
 * Friendly error messages mapping
 */
export function getFriendlyAuthError(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'No internet connection. Please verify your network connection and try again.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in must be enabled in the Firebase Console (Authentication > Sign-in method).';
    default:
      return err.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Sign up with Email and Password and save basic profile to Firestore
 */
export async function firebaseSignUp(params: {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
  persona: TravelerPersona;
  emergencyPin: string;
}): Promise<UserProfile> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('No internet connection. Please verify your network connection and try again.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const fbUser = userCredential.user;

  // Update Auth Profile Display Name
  if (params.displayName) {
    try {
      await updateProfile(fbUser, { displayName: params.displayName });
    } catch {
      // ignore
    }
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    displayName: params.displayName || params.email.split('@')[0],
    email: params.email,
    phoneNumber: params.phoneNumber || '',
    persona: params.persona || 'commuter',
    emergencyPin: params.emergencyPin || '1234',
    createdAt: Date.now(),
    tripsCompletedCount: 0,
    reportsFiledCount: 0,
    bio: '',
    emergencyMedicalInfo: '',
  };

  // Persist Profile to Firestore users collection
  const path = `users/${fbUser.uid}`;
  try {
    await setDoc(doc(db, 'users', fbUser.uid), profile);
  } catch (err) {
    console.warn('Could not save profile doc to Firestore:', err);
  }

  return profile;
}

/**
 * Sign in with Email and Password
 */
export async function firebaseLogin(email: string, password: string): Promise<UserProfile> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('No internet connection. Please verify your network connection and try again.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  // Retrieve existing profile from Firestore if present
  try {
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch {
    // fallback to auth data
  }

  return {
    uid: fbUser.uid,
    displayName: fbUser.displayName || email.split('@')[0],
    email: fbUser.email || email,
    phoneNumber: fbUser.phoneNumber || '+91 98760 12345',
    persona: 'commuter',
    emergencyPin: '1234',
    createdAt: Date.now(),
    tripsCompletedCount: 1,
    reportsFiledCount: 0,
  };
}

/**
 * Send Password Reset Email
 */
export async function firebaseSendPasswordReset(email: string): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('No internet connection. Please verify your network connection and try again.');
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign out current user
 */
export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

/**
 * Update basic user profile (name, phone, medical notes) in Firestore
 */
export async function firebaseUpdateProfile(profile: UserProfile): Promise<void> {
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: profile.displayName });
    } catch {
      // ignore
    }
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), profile, { merge: true });
    } catch (err) {
      console.warn('Could not sync profile to Firestore:', err);
    }
  }
}
