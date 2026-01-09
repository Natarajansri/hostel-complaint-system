import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwAF4AmQkQp6mtpcDHkVZoKggudaHWN6M",
  authDomain: "hostel-complaint-system-68e9c.firebaseapp.com",
  projectId: "hostel-complaint-system-68e9c",
  storageBucket: "hostel-complaint-system-68e9c.appspot.com",
  messagingSenderId: "531241848110",
  appId: "1:531241848110:web:9948a2aa18e46acb857ebf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
