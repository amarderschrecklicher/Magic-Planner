import { todayTask, compareTimes } from "../modules/dateModules";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../modules/firebase';


//const API_BASE_URL = "https://zavrsni-back.herokuapp.com";
const API_BASE_URL = "http://192.168.1.102:8080";
//const API_BASE_URL = "https://zavrsni-be-ba8430d30a0c.herokuapp.com";

export async function fetchAccount(accountID) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/child/${accountID}`
    );
    const data = await response.json();
    await signInWithEmailAndPassword(auth, data.email, data.password);
    console.log("Login success");
    return { name: data.name, gender: data.kidMale, email: data.email, password: data.password };
  } catch (error) {
    console.error("Failed to fetch account in TasksScreen:", error); 
  }
}

export async function fetchTasks(accountID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/task/${accountID}`);
    const data = await response.json();
    let priority = [];
    let normal = [];

    data.forEach((element) => {
      if (!element.done && todayTask(element.dueDate)) {
        if (element.priority) priority.push(element);
        else if (!element.priority) normal.push(element);
      }
    });

    priority.sort(function (a, b) {
      return compareTimes(a, b);
    });

    normal.sort(function (a, b) {
      return compareTimes(a, b);
    });

    return { data, priority, normal };
  } catch (error) {
    console.error("Failed to fetch tasks in TasksScreen:", error);
  }
}

export async function fetchSubTasks(tasks) {
  try {
    let temp = new Map();

    for (let i = 0; i < tasks.length; i++) {
      const url = `${API_BASE_URL}/api/v1/task/sub/${tasks[i].id}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.length != 0) temp.set(tasks[i].id, data);
    }
    return temp;
  } catch (error) {
    console.error("Failed to fetch subTasks in TasksScreen:", error);
  }
}

export async function fetchSettings(accountID) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/account/settings/${accountID}`
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch settings in TasksScreen:", error);
  }
}

export async function updateFinishedSubTasks(id) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/task/sub/done/${id}`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("Failed to update finished task in subTaks:", error);
  }
}

export async function updateFinishedTask(id) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/task/done/${id}`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("Failed to update finished task in Task:", error);
  }
}

export async function fetchStringCodes() {
  const response = await fetch(`${API_BASE_URL}/api/v1/account/settings`);
  const data = await response.json();
  return data;
}

export async function fetchTokens(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/token/${id}`);
  const data = await response.json();
  const token = data.find(token => token.modelId == Device.modelName);
  
  return {token}
}

export async function updateToken(newToken,id) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/token/update/${id}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: newToken,
      })
    });
  } catch (error) {
    console.error("Failed to update finished task in Task:", error);
  }
}

export async function addToken(newToken,id,modelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/token/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accountId: id,
        modelId: modelId,
        token: newToken
      })
    });
    const data = await response.json();
    console.log(data)
    return data;

  } catch (error) {
    console.error("Failed to update finished task in Task:", error);
  }
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    } 

    token = (await Notifications.getExpoPushTokenAsync()).data;

  } else {
    alert('Must use physical device for Push Notifications');
  }
  return token;
}
