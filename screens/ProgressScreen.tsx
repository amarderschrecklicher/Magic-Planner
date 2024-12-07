import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import Task from "../components/Task";
import CurrentDate from "../components/CurrentDate";
import LoadingAnimation from "../components/LoadingAnimation";
import SideButtons from "../components/SideButtons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { fetchTasks, fetchSettings, fetchSubTasks, fetchAccount, TaskData, SubTaskData, SettingsData } from "../modules/fetchingData";
import { StatusBar } from "expo-status-bar";

export default function ProgressScreen({ navigation, route }: { navigation: any, route: any }) {
    const [finishedTasks, setFinishedTasks] = useState<TaskData[] | null>(null);
    const [subTasks, setSubTasks] = useState<Map<number, SubTaskData[]> | null>(null);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [email, setEmail] = useState("");
    const { accountID } = route.params;

    useEffect(() => {
        fetchData(false);

        const unsubscribe = navigation.addListener("focus", () => {
            fetchData(false);
        });

        return () => {
            unsubscribe();
        };
    }, [navigation]);

    async function fetchData(refresh: boolean) {
        try {
            const employeeData = await fetchAccount(accountID);
            if (employeeData) {
                setEmail(employeeData.email);
            }
            const tasksData = await fetchTasks(accountID);
            if (tasksData) {
                const completedTasks = tasksData.finished;
                setFinishedTasks(completedTasks);

                const subtasksData = await fetchSubTasks(tasksData ? tasksData.data : []);

                if(subtasksData)
                  setSubTasks(subtasksData);
            }

            const settingsData = await fetchSettings(accountID);

            if(settingsData)  
              setSettings(settingsData);
        } catch (error) {
            console.error("Failed to fetch data in ProgressScreen:", error);
        }
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleTaskPress = (task: any) => {
        if (subTasks)
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

    if (!finishedTasks || !subTasks || !settings) {
        return <LoadingAnimation />;
    }

    return (
        <SafeAreaView style={{ backgroundColor: settings.colorForBackground, flex: 1 }}>
            <View style={styles.header}>
                <CurrentDate settings={settings} />
            </View>
            <Text
                style={[
                    styles.title,
                    {
                        fontSize: settings.fontSize + 2,
                        fontFamily: settings.font,
                    },
                ]}
            >
                Završeni zadaci
            </Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.verticalTasks}>
                    {finishedTasks.map((task) => {
                        if (!subTasks.get(task.id)) return null;
                        return (
                            <View key={task.id} style={styles.taskItem}>
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
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
            <SideButtons onChatPress={handleChatPress} onSOSPress={handleSOSPress} />
            <StatusBar style="auto" translucent={true} hidden={false} backgroundColor={settings.colorForBackground} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
      },
      verticalTasks: {
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 20,
      },
      taskItem: {
        width: "90%",
        marginBottom: 15,
      },
      title: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 10,
        marginTop: 40,
      },
      taskPressable: {
        width: "100%",
      },
});
