import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { SettingsData, SubTaskData, TaskData, updateFinishedTask } from "../modules/fetchingData";

export default function Task({
  task,
  settings ,
  taskColor,
  subTasks,
  updateTaskScreen,
}:{  task: TaskData,
  settings : SettingsData ,
  taskColor: string,
  subTasks: SubTaskData[],
  updateTaskScreen: any}) {

  const [finishedSubTasks, setFinishedSubTasks] = useState(0);
  const [numberOfSubTasks, setNumberOfSubTasks] = useState(0);

  function countFinishedSubTasks() {
    let counter = 0;
    let total = 0;
    subTasks.forEach((subTask) => {
      if (subTask.done) counter++;
      total++;
    });
    if (counter == total) {
      updateTaskScreen();
      updateFinishedTask(task.id);
    }
    setFinishedSubTasks(counter);
    setNumberOfSubTasks(total);
  }

  useEffect(() => {
    countFinishedSubTasks();
  }, [subTasks]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: task.overDo?taskColor: "#DD6975" }]}>
        <Text
          style={[
            styles.defaultText,
            {
              fontSize: settings.fontSize + 1,
              color: settings.colorForFont,
              fontFamily: settings.font,
              marginBottom: 15, 
            },
          ]}
        >
          Naziv zadatka:
        </Text>
        <Text
          style={{
            fontSize: settings.fontSize,
            color: settings.colorForFont,
            marginBottom: 40,
            fontFamily: settings.font,
            textDecorationLine: "underline",

          }}
        >
          {task.taskName}
        </Text>
        <View style={styles.time}>
          <Text
            style={[
              styles.defaultText,
              {
                fontSize: settings.fontSize + 1,
                color: settings.colorForFont,
                fontFamily: settings.font,
              },
            ]}
          >
            {task.done ? "Završen:" : "Rok izvršavanja:"}
          </Text>
          <Text
            style={{
              fontSize: settings.fontSize,
              color: settings.colorForFont,
              fontFamily: settings.font,
              textDecorationLine: "none",
              marginTop: 5,
            }}
          >
            {task.done ? task.end : task.overDo ? task.dueTime : "Rok prošao"}
          </Text>
        </View>
      </View>
      {!task.done && (
        <View style={styles.progress}>
          <Progress.Bar
            progress={finishedSubTasks / numberOfSubTasks}
            width={null}
            height={15}
            color={settings.colorForProgress}
            borderColor={"black"}
            borderWidth={2}
          />
          <Text
            style={[
              styles.progressText,
              { fontSize: settings.fontSize - 1, fontFamily: settings.font },
            ]}
          >
            {finishedSubTasks} od {numberOfSubTasks} završenih podzadataka
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    elevation: 8,
  },
  progressText: {
    marginTop: 10,
    opacity: 0.8,
  },
  time: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  defaultText: {
    fontWeight: "bold",
  },
});