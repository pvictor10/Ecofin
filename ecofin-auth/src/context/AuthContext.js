import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile, signOut,
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setInitializing(false); });
    return unsub;
  }, []);

  const signIn  = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp  = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    return cred.user;
  };
  const signOutFn = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, signIn, signUp, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
