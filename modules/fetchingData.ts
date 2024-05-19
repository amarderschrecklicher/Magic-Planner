import { todayTask, compareTimes } from "./dateModules";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';
import { Platform } from "react-native";
import Task from "@/components/Task";


//const API_BASE_URL = "https://zavrsni-back.herokuapp.com";
const API_BASE_URL = "http://192.168.1.102:8080";
//const API_BASE_URL = "https://zavrsni-be-ba8430d30a0c.herokuapp.com";

interface EmployeeData{
  name: string,
  gender: boolean,
  email: string,
  password: string,
}

export async function fetchAccount(accountID: number): Promise<{ name: string; gender: boolean; email: string; password: string } | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/child/${accountID}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    await signInWithEmailAndPassword(auth, data.email, data.password);
    console.log("Login success");
    return { name: data.name, gender: data.kidMale, email: data.email, password: data.password };
  } catch (error) {
    console.error("Failed to fetch account in TasksScreen:", error);
    return undefined;
  }
}


export async function fetchTasks(accountID:number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/task/${accountID}`);
    const data = await response.json();
    let priority: any[] =[];
    let normal : any[] =[];

    data.forEach((element:any) => {
      if (!element.done && todayTask(element.dueDate)) {
        if (element.priority) priority.push(element);
        else if (!element.priority) normal.push(element);
      }
    });

    priority.sort(function (a:any, b:any) {
      return compareTimes(a, b);
    });

    normal.sort(function (a:any, b:any) {
      return compareTimes(a, b);
    });

    return { data, priority, normal };
  } catch (error) {
    console.error("Failed to fetch tasks in TasksScreen:", error);
  }
}

export async function fetchSubTasks(tasks: string | any[]) {
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

export async function fetchSettings(accountID:number) {
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

export async function updateFinishedSubTasks(id:number) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/task/sub/done/${id}`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("Failed to update finished task in subTaks:", error);
  }
}

export async function updateFinishedTask(id:number) {
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

export async function fetchTokens(id:number) {
  const response = await fetch(`${API_BASE_URL}/api/v1/token/${id}`);
  const data = await response.json();
  const token = data.find((token: { modelId: any; }) => token.modelId == Device.modelName);
  
  return {token}
}

export async function updateToken(newToken:string,id:number) {
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

export async function addToken(newToken:string,id:number,modelId:string) {
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
