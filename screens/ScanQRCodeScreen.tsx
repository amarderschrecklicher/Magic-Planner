import React, { useEffect } from "react";
import { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { CameraView } from "expo-camera";
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { fetchStringCodes } from "../modules/fetchingData";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/modules/firebase";

export default function ScanQRCodeScreen({ navigation }:{ navigation:any }) {
  const [scanned, setScanned] = useState(false);
  const [stringCodes, setStringCodes] = useState([]);
  const [isAuthenticated, setAuhenticated] = useState(false);
  const [id, setId] = useState(0);
  const [nonExistentAccount, setNonExistentAccount] = useState(false);
  const [email,setEmail]=useState("")

  useEffect(() => {
    fetchCodes();
    console.log(stringCodes)
  }, []);

  async function fetchCodes() {
    const data = await fetchStringCodes();
    setStringCodes(data);
  }

  const storeData = async (child:any) => {
    try {
      await AsyncStorage.setItem("account", child.id.toString());
      await AsyncStorage.setItem("email", child.email);
      await AsyncStorage.setItem("password", child.password);
      await signInWithEmailAndPassword(auth, child.email, child.password);
      console.log("Login success");
    } catch (e) {
      console.log("Error when storing data: " + e);
    }
  };

  const handleBarCodeScanned = async ({ type, data }:{ type:any, data:any }) => {
    setScanned(true);
    let findAccount = false;
    console.log(stringCodes)
    stringCodes.forEach((string: any)  => {
      if (string.phoneLoginString == data) {
        storeData(string.child);
        console.log(
          "ID koji se ubacuje u async storage: " +
            string.child.id +
            " i skeniran kod: " +
            data
        );
        setAuhenticated(true);
        setId(string.child.id);
        setEmail(string.child.email)
        findAccount = true;
      }
    });

    if (!findAccount) setNonExistentAccount(true);
  };

  const navigationReset = () => {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "BottomNavigator",
          params: { accountID: id,email: email },
        },
      ],
    });

    navigation.dispatch(resetAction);
  };

  if (isAuthenticated)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LottieView
          source={require("../assets/animations/successfullyLogin.json")}
          autoPlay
          loop={false}
          onAnimationFinish={navigationReset}
          style={{ width: 300, height: 300 }}
        />
        <Text style={{ fontSize: 26 }}>Uspješna prijava!</Text>
      </View>
    );
  else if (!isAuthenticated && !nonExistentAccount)
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </SafeAreaView>
    );
  else if (!isAuthenticated && nonExistentAccount)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LottieView
          source={require("../assets/animations/failedLogin.json")}
          autoPlay
          loop={false}
          style={{ width: 300, height: 300 }}
        />
        <Text style={{ fontSize: 26 }}>Prijava nije uspjela!</Text>
        <Text style={{ fontSize: 22 }}>Profil ne postoji</Text>
        <TouchableOpacity
          style={styles.failedButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
            Ok
          </Text>
        </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  failedButton: {
    backgroundColor: "#E25B5B",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    elevation: 5,
    width: 230,
  },
});
