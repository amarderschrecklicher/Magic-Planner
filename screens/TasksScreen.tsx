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
  updateToken,
  SettingsData,
  SubTaskData,
  TaskData
} from "../modules/fetchingData";
import CurrentDate from "../components/CurrentDate";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { CommonActions } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';
import { Notification, NotificationResponse } from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideButtons from "../components/SideButtons";


export default function TasksScreen({ navigation, route }:{navigation:any,route:any}) {

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const [kidName, setKidName] = useState("");
  const [maleKid, setMaleKid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [priorityTasks, setPriorityTasks] = useState<TaskData[] | null>(null);
  const [normalTasks, setNormalTasks] = useState<TaskData[] | null>(null);
  const [subTasks, setSubTasks] = useState<Map<number, SubTaskData[]> | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { accountID } = route.params;
  
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

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notification) => {
      const taskName = notification.request.content.body || undefined;
      const id = notification.request.content.data.taskId as string;
      setNotification(notification as Notification);

      Alert.alert(
        "Imaš novi task!",
        taskName,
        [{ text: "Pogledaj task", onPress: () => handleOKPress(id) }]
      );
    });
    

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: NotificationResponse) => {
      console.log(response);
    });
        
    return () => {
      unsubscribe;
      if (notificationListener.current)
      Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [navigation]);

  async function fetchData() {
    try {
      
      const employeeData = await fetchAccount(accountID);

      if(employeeData){

      setKidName(employeeData.name);
      setMaleKid(employeeData.gender);
      setEmail(employeeData.email);
      setPassword(employeeData.password);

      const settingsData = await fetchSettings(accountID);

      if(settingsData)  
        setSettings(settingsData);
      
      const tasksData = await fetchTasks(accountID);
      
      if(tasksData){
        setPriorityTasks(tasksData.priority);
        setNormalTasks(tasksData.normal);
      }
      const subtasksData = await fetchSubTasks(tasksData ? tasksData.data : []);

      if(subtasksData)
        setSubTasks(subtasksData);
      
      await registerForPushNotificationsAsync().then(token => {
        if(token && token!="")
          setExpoPushToken(token)
        }
      );

      const { token } = await fetchTokens(accountID)
      console.log(token)
      console.log(expoPushToken)

      if(token == null || token == undefined)   
        addToken(expoPushToken,accountID,Device.modelName  || "")
      else if (expoPushToken!="")
        updateToken(expoPushToken,accountID)

      }
      else{
        await AsyncStorage.removeItem("account")
        navigation.navigate('Home', { accountID: 0 });
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

  const handleTaskPress = (task:any) => {
    if(subTasks)
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

  const handleOKPress = (task:any) =>{
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b5998',
  },
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
