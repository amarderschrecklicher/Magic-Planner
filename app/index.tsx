import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchFonts } from '../modules/fontLoader';
import AppNavigator from '../navigation/AppNavigator';
import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/modules/firebase";
import registerNNPushToken from "native-notify";

export default function App() {
  const [accountID, setAccountID] = useState<number | null>(null);
  const [email,setEmail]=useState("")
  registerNNPushToken(22259, 'xldIGxZI7b0qgDgbFDRgUP');

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("account");
      let email = await AsyncStorage.getItem("email");
      if(email)
      setEmail(email)
      const password = await AsyncStorage.getItem("password");

      console.log("Id u async storage: " + value);
      if (value && email && password) {
        const id = parseInt(value);
        setAccountID(id);
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login success");
      } else setAccountID(0);
    } catch (e) {
      console.log("Error when geting data: " + e);
    }
  };

  useEffect(() => {
    fetchFonts();
    getData();

  }, []);

  if (accountID == null) return <LoadingAnimation />;
  else {
    return (
      <>
        <StatusBar hidden />
        <AppNavigator accountID={accountID} email={email}/>
      </>
    );
  }

}