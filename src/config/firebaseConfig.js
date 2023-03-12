import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-Z1DY7Itv9-YVKSuiVX--nEOyaVwd2ns",
  authDomain: "aatmagyan-web.firebaseapp.com",
  projectId: "aatmagyan-web",
  storageBucket: "aatmagyan-web.appspot.com",
  messagingSenderId: "690419395725",
  appId: "1:690419395725:web:711e3dc40b1f5e871946c4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();