import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from "../screens/ChatScreen";
import HomeScreen from "../screens/HomeScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import ScanQRCodeScreen from "../screens/ScanQRCodeScreen";
import TasksScreen from "../screens/TasksScreen";
import SubTasksScreen from "../screens/SubTasksScreen";
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomNavigator = ({ route }:{route:any}) =>  {

  const { accountID } = route.params; 

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Tasks"
        component={TasksScreen}
        initialParams={{ accountID: accountID }}
        options={{
          title: "Taskovi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Materijali" 
        component={MaterialsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ accountID }:{ accountID:number }) => {
    
  return (
        <Stack.Navigator >
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
            initialParams={{ accountID: accountID }}
            options={{
              title: "Tasks",
              headerShown: false,
            }}
          />          
        </Stack.Navigator>
  );
};


    /*           
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
          */

export default AppNavigator;