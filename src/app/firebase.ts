import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCWx48ZXJCoi7yRTkj0daOTA7laCXJxjB4',
  authDomain: 'love-in-flight.firebaseapp.com',
  projectId: 'love-in-flight',
  storageBucket: 'love-in-flight.firebasestorage.app',
  messagingSenderId: '580039735289',
  appId: '1:580039735289:web:52ea35ef68bff66691ef28',
  measurementId: 'G-5YW1YCBZML',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
