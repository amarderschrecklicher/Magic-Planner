import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { Camera } from "expo-camera";
import { CommonActions } from "@react-navigation/native";

export default function HomeScreen({ navigation, route }:{ navigation:any, route:any }) {
  const { accountID } = route.params;

  useEffect(() => {
    console.log(accountID)
    if (accountID!=0) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "BottomNavigator",
              params: { accountID: accountID },
            },
          ],
        })
      );      
    }
  }, [accountID]);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status == "granted") navigation.navigate("ScanQRCode");
      else {
        Alert.alert(
          "Permission needed",
          "Da biste koristili aplikaciju Assistify, potrebno je da dozvolite korištenje kamere u postavkama",
          [
            {
              text: "Cancel",
              onPress: undefined,
              style: "cancel",
            },
            {
              text: "Go to settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    })();
  };

  const handleScanButton = () => {
    askForCameraPermission();
  };

  return (
    <View style={styles.container}>
      <View style={styles.image}>
        <Image
          style={{ height: "38%", resizeMode: "contain" }}
          source={require("../assets/images/logoapp.png")}
        ></Image>
      </View>
      <TouchableOpacity style={styles.scanButton} onPress={handleScanButton}>
        <Text style={styles.text}>Skeniraj QR kod za prijavu</Text>
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
  image: {
    marginTop: 230,
  },
  scanButton: {
    backgroundColor: "#07255d",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    elevation: 5,
  },
  text: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
});
