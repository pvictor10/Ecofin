import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwW2FS41yvxxkK6sAAUimKF-NYBh4slyI",
  authDomain: "ecofin-157f4.firebaseapp.com",
  projectId: "ecofin-157f4",
  storageBucket: "ecofin-157f4.firebasestorage.app",
  messagingSenderId: "899150807587",
  appId: "1:899150807587:web:ff4d9a94ca8d0dd4d9e796",
  measurementId: "G-DR9FL4BNR2"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
