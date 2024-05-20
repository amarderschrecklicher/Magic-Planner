import { todayTask, compareTimes } from "./dateModules";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';
import { Platform } from "react-native";


//const API_BASE_URL = "https://zavrsni-back.herokuapp.com";
const API_BASE_URL = "http://192.168.1.102:8080";
//const API_BASE_URL = "https://zavrsni-be-ba8430d30a0c.herokuapp.com";

export interface TaskData {
  id: number;
  name: string;
  dueDate: string;
  priority: boolean;
  done: boolean;
}

export interface SubTaskData {
  id: number;
  parentTaskId: string;
  name: string;
  done: boolean;
  description: string
}

export interface SettingsData{
  colorForBackground:string,
  fontSize:number,
  font:string,
  colorOfNormalTask:string,
  colorOfPriorityTask:string,
  colorForFont:string,
  colorForProgress:string
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


export async function fetchTasks(accountID: number): Promise<{ data: any[], priority: any[], normal: any[] } | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/task/${accountID}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    let priority: any[] = [];
    let normal: any[] = [];

    data.forEach((element: any) => {
      if (!element.done && todayTask(element.dueDate)) {
        if (element.priority) priority.push(element);
        else normal.push(element);
      }
    });

    priority.sort((a: any, b: any) => compareTimes(a, b));
    normal.sort((a: any, b: any) => compareTimes(a, b));

    return { data, priority, normal };
  } catch (error) {
    console.error("Failed to fetch tasks in TasksScreen:", error);
    return undefined;
  }
}


export async function fetchSubTasks(tasks: TaskData[]): Promise<Map<number, SubTaskData[]> | void> {
  try {
    const temp = new Map<number, SubTaskData[]>();

    for (const task of tasks) {
      const url = `${API_BASE_URL}/api/v1/task/sub/${task.id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch subTasks for task ${task.id}`);
      }

      const data: SubTaskData[] = await response.json();
      if (data.length !== 0) {
        temp.set(task.id, data);
      }
    }

    return temp;
  } catch (error) {
    console.error("Failed to fetch subTasks in TasksScreen:", error);
  }
}


export async function fetchSettings(accountID:number): Promise<SettingsData | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/account/settings/${accountID}`
    );
    const data = await response.json();

    const settings:SettingsData = {
      colorForBackground:data.colorForBackground,
      fontSize: data.fontSize,
      font: data.font,
      colorOfNormalTask: data.colorOfNormalTask,
      colorOfPriorityTask: data.colorOfPriorityTask,
      colorForFont: data.colorForFont,
      colorForProgress: data.colorForProgress
    }

    return settings;
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