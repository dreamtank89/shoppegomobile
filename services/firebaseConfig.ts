import { initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence is valid in runtime but types might be mismatching in some versions
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCiQK0GsQhep4EGJT661_hFEcbGz2sj1Jg",
    authDomain: "shoppego-dashboard-fp.firebaseapp.com",
    projectId: "shoppego-dashboard-fp",
    storageBucket: "shoppego-dashboard-fp.firebasestorage.app",
    messagingSenderId: "691785267132",
    appId: "1:691785267132:web:e16e6cfba79913bd6a9db9"
};

const app = initializeApp(firebaseConfig);

// Use React Native persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const functions = getFunctions(app);
