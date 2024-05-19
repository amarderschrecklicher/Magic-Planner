import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAH2dqWzqMwwXr8Nu0S4pmDEgT186hQc2c",
    authDomain: "magic-planner-530fc.firebaseapp.com",
    projectId: "magic-planner-530fc",
    storageBucket: "magic-planner-530fc.appspot.com",
    messagingSenderId: "752799112874",
    appId: "1:752799112874:web:45961411dfa9a0c3b9bad3",
    measurementId: "G-E6XF2P5LW5"
  };

initializeApp(firebaseConfig)
export const auth = getAuth();
export const database = getFirestore();
