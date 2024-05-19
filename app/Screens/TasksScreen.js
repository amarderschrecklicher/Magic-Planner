import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import Task from "../components/Task";
import WelcomeMessage from "../components/WelcomeMessage";
import LoadingAnimation from "../components/LoadingAnimation";
import CelebrationAnimation from "../components/CelebrationAnimation";
import {
  fetchTasks,
  fetchAccount,
  fetchSettings,
  fetchSubTasks,
  fetchTokens,
  addToken,
  registerForPushNotificationsAsync,
  updateToken
} from "../modules/fetchingData";
import CurrentDate from "../components/CurrentDate";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { CommonActions } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideButtons from "../components/SideButtons";

export default function TasksScreen({ navigation, route }) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [kidName, setKidName] = useState(null);
  const [maleKid, setMaleKid] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [priorityTasks, setPriorityTasks] = useState(null);
  const [normalTasks, setNormalTasks] = useState(null);
  const [subTasks, setSubTasks] = useState(null);
  const [settings, setSettings] = useState({});
  const { accountID } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    fetchData();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchData();
      
    });
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      taskName = notification.request.content.body;
      id = notification.request.content.data.taskId;
      setNotification(notification);
      
      Alert.alert(
        "Imaš novi task!",
        taskName,
        [{ text: "Pogledaj task", onPress: () => handleOKPress(id) }]
      );
        
    });
    

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
        
    return () => {
      unsubscribe;
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function fetchData() {
    try {
      
      const { name, gender, email, password } = await fetchAccount(accountID);

      if(name == undefined){
        await AsyncStorage.removeItem("account")
        navigation.navigate('Home', { accountID: 0 });
      }
      else{
      setKidName(name);
      setMaleKid(gender);
      setEmail(email);
      setPassword(password);

      const setting = await fetchSettings(accountID);
      setSettings(setting);
      
      const { data, priority, normal } = await fetchTasks(accountID);
      setPriorityTasks(priority);
      setNormalTasks(normal);

      const allSubTasks = await fetchSubTasks(data);
      setSubTasks(allSubTasks);

      await registerForPushNotificationsAsync().then(token => {
        if(token!="")
          setExpoPushToken(token)
        }
      );

      const { token } = await fetchTokens(accountID)
      console.log(token)
      console.log(expoPushToken)

      if(token == null || token == undefined)   
        addToken(expoPushToken,accountID,Device.modelName)
      else if (expoPushToken!="")
      updateToken(expoPushToken,accountID)

      }
    } catch (error) {
      navigation.navigate('Home', { accountID: 0 });
      console.error("Failed to fetch data in TasksScreen:", error);
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const alertFunction = () => {
    Alert.alert(
      "Da li ste sigurni da se želite odjaviti?",
      "Ako se odjavite ponovo ćete morati skenirati QR kod kako biste se prijavili.",
      [
        {
          text: "Ne",
          onPress: undefined,
          style: "cancel",
        },
        {
          text: "Da",
          onPress: logout,
        },
      ]
    );
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("account");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Home",
              params: { accountID: 0 },
            },
          ],
        })
      );
    } catch (e) {
      console.log("Error when storing data: " + e);
    }
  };

  const handleTaskPress = (task) => {
    navigation.navigate("SubTasks", {
      task: task,
      settings: settings,
      subTasks: subTasks.get(task.id),
    });
  };

  const handleChatPress = () => {
    navigation.navigate("Chat", {
      email: email,
      accountID: accountID
    });
  };

  const handleSOSPress = () => {
    navigation.navigate("Chat", {
      sos: "SOS",
      email: email,
      accountID: accountID
    });
  };

  const handleOKPress = (task) =>{
    onRefresh();
    //handleTaskPress(task);
    console.log("Notification acknowledged")
  };
    

  if (
    subTasks == null ||
    priorityTasks == null ||
    normalTasks == null ||
    kidName == null ||
    //ne zaboravi dodat maleKid
    settings == null ||
    expoPushToken==""
  ){
    return <LoadingAnimation />;
  }
  else if (
    (priorityTasks.length == 0 && normalTasks.length == 0) ||
    subTasks.size == 0
  ){
    return (
      <SafeAreaView style={{ backgroundColor: settings.colorForBackground, flex: 1 }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View>
            <CurrentDate settings={settings} />
            <TouchableOpacity style={styles.logoutButton} onPress={alertFunction}>
              <SimpleLineIcons name="logout" size={40}></SimpleLineIcons>
            </TouchableOpacity>
          </View>
          <CelebrationAnimation kidName={kidName} maleKid={maleKid} settings={settings} />
        </ScrollView>
        <SideButtons onChatPress={handleChatPress} onSOSPress={handleSOSPress} />
      </SafeAreaView>
    );
        }
  else{
    return (
      <SafeAreaView
        style={{ backgroundColor: settings.colorForBackground, flex: 1 }}
      >
        <View style={styles.header}>
          <CurrentDate settings={settings} />
          <TouchableOpacity style={styles.logoutButton} onPress={alertFunction}>
            <SimpleLineIcons name="logout" size={40}></SimpleLineIcons>
          </TouchableOpacity>
        </View>
        <WelcomeMessage name={kidName} male={maleKid} settings={settings} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {priorityTasks.length != 0 ? (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: settings.fontSize + 2,
                    fontFamily: settings.font,
                  },
                ]}
              >
                Prioritetni zadaci
              </Text>
              <View style={styles.tasks}>
                <ScrollView
                  horizontal
                  decelerationRate={0.9}
                  snapToInterval={305} //your element width
                  snapToAlignment={"start"}
                  showsHorizontalScrollIndicator={false}
                >
                  {priorityTasks.map((task) => {
                    if (!subTasks.get(task.id)) return null;
                    return (
                      <View key={task.id}>
                        <TouchableOpacity
                          activeOpacity={0.6}
                          style={styles.taskPressable}
                          onPress={() => handleTaskPress(task)}
                        >
                          <Task
                            task={task}
                            settings={settings}
                            taskColor={settings.colorOfPriorityTask}
                            subTasks={subTasks.get(task.id)}
                            updateTaskScreen={fetchData}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          ) : undefined}

          {normalTasks.length != 0 ? (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: settings.fontSize + 2,
                    fontFamily: settings.font,
                  },
                ]}
              >
                Manje prioritetni zadaci
              </Text>
              <View style={styles.tasks}>
                <ScrollView
                  horizontal
                  decelerationRate={0.9}
                  snapToInterval={305} //your element width
                  snapToAlignment={"start"}
                  showsHorizontalScrollIndicator={false}
                >
                  {normalTasks.map((task) => {
                    if (!subTasks.get(task.id)) return null;
                    return (
                      <View key={task.id}>
                        <TouchableOpacity
                          activeOpacity={0.6}
                          style={styles.taskPressable}
                          onPress={() => {
                            handleTaskPress(task);
                          }}
                        >
                          <Task
                            task={task}
                            settings={settings}
                            taskColor={settings.colorOfNormalTask}
                            subTasks={subTasks.get(task.id)}
                            updateTaskScreen={fetchData}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          ) : undefined}
        </ScrollView>
        <SideButtons onChatPress={handleChatPress} onSOSPress={handleSOSPress} />
      </SafeAreaView>
    );
}
}

const styles = StyleSheet.create({
  tasks: {
    marginBottom: 50,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    marginLeft: 25,
    marginBottom: 10,
    marginTop: 20,
  },
  taskPressable: {
    width: 280,
    marginLeft: 25,
  },
  congratulationBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  congratulationsText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 15,
    marginLeft: 15,
  },
  container: {
    flex: 1,
    // Add other styles for your main content container if needed
  },
  buttonContainer: {
    position: 'absolute', // Position the container absolutely
    bottom: 16, // Adjust the bottom spacing as needed
    right: 16, // Adjust the right spacing as needed
  },
  button: {
    backgroundColor: 'blue', // Set the background color of the button
    width: 64, // Set the width and height to make it circular
    height: 64,
    borderRadius: 32, // Set half of the width to make it circular
    alignItems: 'center', // Center the icon horizontally
    justifyContent: 'center', // Center the icon vertically
    // Add other styles for the button if needed
  },
});
