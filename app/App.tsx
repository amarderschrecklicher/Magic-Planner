import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import LoadingAnimation from "../components/LoadingAnimation";
import { fetchFonts } from '../modules/fontLoader';
import AppNavigator from '../navigation/AppNavigator';
import React from "react";

export default function App() {
  const [accountID, setAccountID] = useState(0);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("account");
      console.log("Id u async storage: " + value);
      if (value != null) {
        const id = parseInt(value);
        setAccountID(id);
      } else setAccountID(0);
    } catch (e) {
      console.log("Error when geting data: " + e);
    }
  };

  useEffect(() => {
    fetchFonts();
    getData();

  }, []);

  if (accountID == 0) return <LoadingAnimation />;
  else {
    return (
      <>
        <StatusBar hidden />
        <AppNavigator accountID={accountID} />
      </>
    );
  }
}