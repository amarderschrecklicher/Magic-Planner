import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from "./ChatScreen";
import HomeScreen from "./HomeScreen";
import MaterialsScreen from "./MaterialsScreen";
import ScanQRCodeScreen from "./ScanQRCodeScreen";
import TasksScreen from "./TasksScreen";
import SubTasksScreen from "./SubTasksScreen";
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

/*
const BottomNavigator = ({ route }:{route:any}) => {

  const colorScheme = useColorScheme();
  const { accountID } = route.params; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen 
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
      <Tabs.Screen 
        name="Materijali" 
        component={MaterialsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}* */

const AppNavigator = ({ accountID }:{ accountID:number }) => {
    
  return (
      <NavigationContainer>
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
        </Stack.Navigator>
      </NavigationContainer>
  );
};


    /*      <Stack.Screen
            name="BottomNavigator"
            component={BottomNavigator}
            initialParams={{ accountID: accountID }}
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
          */

export default AppNavigator;