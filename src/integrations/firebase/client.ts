import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "angelic-lattice-499717-f8",
  appId: "1:670579056962:web:b357bb692de6a58737a8db",
  apiKey: "AIzaSyDWgL-HgC7k1CDfTIrXEPcrKIuCg9m6grU",
  authDomain: "angelic-lattice-499717-f8.firebaseapp.com",
  storageBucket: "angelic-lattice-499717-f8.firebasestorage.app",
  messagingSenderId: "670579056962",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-pixelperfectrepl-b8cfac7d-18e8-4d90-9750-c07797b52a71");
