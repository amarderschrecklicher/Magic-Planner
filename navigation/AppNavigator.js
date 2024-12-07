import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ChatScreen from "../screens/ChatScreen";
import HomeScreen from "../screens/HomeScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import ScanQRCodeScreen from "../screens/ScanQRCodeScreen";
import TasksScreen from "../screens/TasksScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SubTasksScreen from "../screens/SubTasksScreen";
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from "@react-navigation/stack";
import { registerIndieID, unregisterIndieDevice } from "native-notify";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomNavigator =  ( {route} ) =>  {

  const { accountID, email } = route.params; 
  registerIndieID(`${email}`, 22259, 'xldIGxZI7b0qgDgbFDRgUP');

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Tasks"
        component={TasksScreen}
        initialParams={{ accountID: accountID, email: email }}
        options={{
          title: "Taskovi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Progress"
        component={ProgressScreen}
        initialParams={{ accountID: accountID, email: email }}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Instrukcije"
        component={MaterialsScreen}
        initialParams={{ accountID: accountID, email: email }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = ({accountID,email}) => {
  const initialRouteName = accountID > 0 ? "BottomNavigator" : "Home";

  return (
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Welcome", headerShown: false }}
            initialParams={{ accountID: accountID }}
          />
          <Stack.Screen
            name="ScanQRCode"
            component={ScanQRCodeScreen}
            options={{ title: "Scan", headerShown: false }}
          />
          <Stack.Screen
            name="BottomNavigator"
            component={BottomNavigator}
            initialParams={{ accountID: accountID, email:email }}
            options={{
              title: "Tasks",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SubTasks"
            component={SubTasksScreen}
            options={{
            headerShown: false,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
            headerShown: false,
            }}
          />          
        </Stack.Navigator>
  );
};

export default AppNavigator;